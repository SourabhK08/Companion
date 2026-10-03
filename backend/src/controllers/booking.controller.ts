import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import * as bookingService from "../services/booking.service.js";
import { emitToUser } from "../lib/socket.js";
import { notify } from "../services/notification.service.js";
import { scheduleMeetingEndWarning } from "../lib/meeting-timer.js";

// ─── POST /api/bookings ───────────────────────────────────

export async function createBooking(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { companionProfileId, scheduledDate, durationHours, venue, note } = req.body;

    if (!companionProfileId || !scheduledDate || !durationHours) {
      res.status(400).json({
        success: false,
        message: "companionProfileId, scheduledDate, and durationHours are required",
      });
      return;
    }

    const booking = await bookingService.createBooking({
      clientId: req.userId,
      companionProfileId,
      scheduledDate,
      durationHours,
      venue,
      note,
    });

    const totalRupees = booking.totalAmount / 100;
    const schedDate = new Date(booking.scheduledDate);
    const dateStr = schedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const timeStr = schedDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    // Notify companion via Socket.IO
    emitToUser(booking.companionProfile.userId, "booking_request", { booking });

    // DB Notification → Companion
    await notify({
      userId: booking.companionProfile.userId,
      type: "BOOKING",
      title: "New Booking Request! 📩",
      body: `${booking.client.fullName} wants to meet you on ${dateStr} at ${timeStr} for ${durationHours} hour(s). Tap to accept or decline.`,
      icon: "calendar",
      linkUrl: "/bookings",
    });

    // DB Notification → Client
    await notify({
      userId: req.userId,
      type: "BOOKING",
      title: "Booking Request Sent ✈️",
      body: `Your booking with ${booking.companionProfile.user.fullName} for ${dateStr} has been sent. ₹${totalRupees.toLocaleString("en-IN")} is held from your wallet.`,
      icon: "calendar",
      linkUrl: "/bookings",
    });

    // Wallet hold notification → Client
    await notify({
      userId: req.userId,
      type: "WALLET",
      title: "Amount Held 🔒",
      body: `₹${totalRupees.toLocaleString("en-IN")} has been held from your wallet for your upcoming booking. It will be released if the booking is declined.`,
      icon: "lock",
      linkUrl: "/wallet",
    });

    res.status(201).json({
      success: true,
      data: { booking },
      message: "Booking request sent to companion",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create booking";
    console.error("Create booking error:", error);
    const statusCode = message.includes("Insufficient") ? 402 : 400;
    res.status(statusCode).json({ success: false, message });
  }
}

// ─── GET /api/bookings ────────────────────────────────────

export async function listBookings(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const status = req.query.status as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await bookingService.listBookings(req.userId, status, page, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("List bookings error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
}

// ─── GET /api/bookings/:id ────────────────────────────────

export async function getBooking(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const bookingId = req.params.id as string;
    const booking = await bookingService.getBooking(bookingId, req.userId);
    res.json({ success: true, data: { booking } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch booking";
    console.error("Get booking error:", error);
    const statusCode = message.includes("not found") ? 404 : message.includes("denied") ? 403 : 500;
    res.status(statusCode).json({ success: false, message });
  }
}

// ─── PATCH /api/bookings/:id/accept ───────────────────────

export async function acceptBooking(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const bookingId = req.params.id as string;
    const { booking, otpCode } = await bookingService.acceptBooking(bookingId, req.userId);

    const schedDate = new Date(booking.scheduledDate);
    const dateStr = schedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const timeStr = schedDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    // Notify client: booking confirmed + OTP
    emitToUser(booking.clientId, "booking_confirmed", { booking, otpCode });

    // DB Notification → Client
    await notify({
      userId: booking.clientId,
      type: "BOOKING",
      title: "Booking Confirmed! 🎉",
      body: `${booking.companionProfile.user.fullName} accepted your booking for ${dateStr} at ${timeStr}. Your meeting OTP is: ${otpCode}. Share it when you meet.`,
      icon: "check-circle",
      linkUrl: "/bookings",
    });

    // DB Notification → Companion
    await notify({
      userId: booking.companionProfile.userId,
      type: "BOOKING",
      title: "You Accepted a Booking ✅",
      body: `You've confirmed the booking with ${booking.client.fullName} on ${dateStr} at ${timeStr}. The client will share the OTP when you meet.`,
      icon: "check-circle",
      linkUrl: "/bookings",
    });

    res.json({
      success: true,
      data: { booking },
      message: "Booking accepted. OTP sent to client.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to accept booking";
    console.error("Accept booking error:", error);
    res.status(400).json({ success: false, message });
  }
}

// ─── PATCH /api/bookings/:id/reject ───────────────────────

export async function rejectBooking(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const bookingId = req.params.id as string;
    const { reason } = req.body;

    const booking = await bookingService.rejectBooking(bookingId, req.userId, reason);
    const totalRupees = booking.totalAmount / 100;

    // Notify client: booking rejected + funds released
    emitToUser(booking.clientId, "booking_rejected", { booking, reason: booking.rejectionReason });

    // DB Notification → Client
    await notify({
      userId: booking.clientId,
      type: "BOOKING",
      title: "Booking Declined 😔",
      body: `${booking.companionProfile.user.fullName} declined your booking request. ₹${totalRupees.toLocaleString("en-IN")} has been refunded to your wallet.`,
      icon: "x-circle",
      linkUrl: "/bookings",
    });

    // Wallet refund notification → Client
    await notify({
      userId: booking.clientId,
      type: "WALLET",
      title: "Hold Released — Refund 💸",
      body: `₹${totalRupees.toLocaleString("en-IN")} held for your booking has been released back to your wallet.`,
      icon: "wallet",
      linkUrl: "/wallet",
    });

    res.json({
      success: true,
      data: { booking },
      message: "Booking rejected. Held amount has been released.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reject booking";
    console.error("Reject booking error:", error);
    res.status(400).json({ success: false, message });
  }
}

// ─── PATCH /api/bookings/:id/cancel ───────────────────────

export async function cancelBooking(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const bookingId = req.params.id as string;
    const booking = await bookingService.cancelBooking(bookingId, req.userId);
    const totalRupees = booking.totalAmount / 100;

    // Notify companion: booking cancelled
    emitToUser(booking.companionProfile.userId, "booking_cancelled", { booking });

    // DB Notification → Companion
    await notify({
      userId: booking.companionProfile.userId,
      type: "BOOKING",
      title: "Booking Cancelled ❌",
      body: `${booking.client.fullName} has cancelled the booking. No further action is needed.`,
      icon: "x-circle",
      linkUrl: "/bookings",
    });

    // DB Notification → Client
    await notify({
      userId: req.userId,
      type: "BOOKING",
      title: "Booking Cancelled",
      body: `You cancelled your booking. ₹${totalRupees.toLocaleString("en-IN")} has been refunded to your wallet.`,
      icon: "x-circle",
      linkUrl: "/bookings",
    });

    // Wallet refund notification → Client
    await notify({
      userId: req.userId,
      type: "WALLET",
      title: "Refund Processed 💸",
      body: `₹${totalRupees.toLocaleString("en-IN")} has been released back to your wallet from the cancelled booking.`,
      icon: "wallet",
      linkUrl: "/wallet",
    });

    res.json({
      success: true,
      data: { booking },
      message: "Booking cancelled. Full refund issued.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel booking";
    console.error("Cancel booking error:", error);
    res.status(400).json({ success: false, message });
  }
}

// ─── POST /api/bookings/:id/verify-otp ────────────────────

export async function verifyOTP(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const bookingId = req.params.id as string;
    const { otp } = req.body;

    if (!otp || typeof otp !== "string") {
      res.status(400).json({ success: false, message: "OTP is required" });
      return;
    }

    const booking = await bookingService.verifyOTP(bookingId, req.userId, otp);

    // Notify client: meeting started
    emitToUser(booking.clientId, "meeting_started", { booking });

    // DB Notification → Client
    await notify({
      userId: booking.clientId,
      type: "MEETING",
      title: "Meeting Started! 🤝",
      body: `Your meeting with ${booking.companionProfile.user.fullName} has started. Duration: ${booking.durationHours} hour(s). Enjoy!`,
      icon: "play",
      linkUrl: "/bookings",
    });

    // DB Notification → Companion
    await notify({
      userId: booking.companionProfile.userId,
      type: "MEETING",
      title: "Meeting Started! 🤝",
      body: `Your meeting with ${booking.client.fullName} is now in progress. Duration: ${booking.durationHours} hour(s).`,
      icon: "play",
      linkUrl: "/bookings",
    });

    // Schedule 15-minute warning before meeting end
    scheduleMeetingEndWarning(
      booking.id,
      booking.clientId,
      booking.companionProfile.userId,
      booking.durationHours,
      booking.client.fullName,
      booking.companionProfile.user.fullName,
    );

    res.json({
      success: true,
      data: { booking },
      message: "OTP verified! Meeting has started.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to verify OTP";
    console.error("Verify OTP error:", error);
    res.status(400).json({ success: false, message });
  }
}

// ─── PATCH /api/bookings/:id/end ──────────────────────────

export async function endMeeting(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const bookingId = req.params.id as string;
    const booking = await bookingService.endMeeting(bookingId, req.userId);

    const totalRupees = booking.totalAmount / 100;
    const platformFeeRupees = booking.platformFee / 100;
    const earningRupees = totalRupees - platformFeeRupees;

    // Calculate actual duration
    let durationText = `${booking.durationHours} hour(s)`;
    if (booking.meetingStartedAt && booking.meetingEndedAt) {
      const startMs = new Date(booking.meetingStartedAt).getTime();
      const endMs = new Date(booking.meetingEndedAt).getTime();
      const diffMinutes = Math.round((endMs - startMs) / (1000 * 60));
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      durationText = hours > 0 ? `${hours}h ${mins}m` : `${mins} minutes`;
    }

    // Notify both parties
    emitToUser(booking.clientId, "meeting_completed", { booking });
    emitToUser(booking.companionProfile.userId, "meeting_completed", { booking });

    // DB Notification → Client
    await notify({
      userId: booking.clientId,
      type: "MEETING",
      title: "Meeting Completed! ✨",
      body: `Your meeting lasted ${durationText}. ₹${totalRupees.toLocaleString("en-IN")} has been charged. Thank you for using Modhuralap!`,
      icon: "check-circle",
      linkUrl: "/bookings",
    });

    // DB Notification → Companion
    await notify({
      userId: booking.companionProfile.userId,
      type: "MEETING",
      title: "Meeting Completed — Earnings Credited! 🎉",
      body: `Meeting duration: ${durationText}. ₹${earningRupees.toLocaleString("en-IN")} has been credited to your wallet (after 10% platform fee).`,
      icon: "wallet",
      linkUrl: "/wallet",
    });

    // Wallet deduction notification → Client
    await notify({
      userId: booking.clientId,
      type: "WALLET",
      title: "Payment Settled 💳",
      body: `₹${totalRupees.toLocaleString("en-IN")} has been deducted from your wallet for the completed meeting.`,
      icon: "credit-card",
      linkUrl: "/wallet",
    });

    res.json({
      success: true,
      data: { booking },
      message: "Meeting completed. Payment has been settled.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to end meeting";
    console.error("End meeting error:", error);
    res.status(400).json({ success: false, message });
  }
}
