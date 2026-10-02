import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import * as bookingService from "../services/booking.service.js";
import { emitToUser } from "../lib/socket.js";

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

    // Notify companion via Socket.IO
    emitToUser(booking.companionProfile.userId, "booking_request", { booking });

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

    // Notify client: booking confirmed + OTP
    emitToUser(booking.clientId, "booking_confirmed", {
      booking,
      otpCode,
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

    // Notify client: booking rejected + funds released
    emitToUser(booking.clientId, "booking_rejected", {
      booking,
      reason: booking.rejectionReason,
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

    // Notify companion: booking cancelled
    emitToUser(booking.companionProfile.userId, "booking_cancelled", { booking });

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

    // Notify both parties
    emitToUser(booking.clientId, "meeting_completed", { booking });
    emitToUser(booking.companionProfile.userId, "meeting_completed", { booking });

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
