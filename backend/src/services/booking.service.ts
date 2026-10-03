import { prisma } from "../lib/prisma.js";
import * as walletService from "./wallet.service.js";
import crypto from "crypto";
import { clearMeetingTimers } from "../lib/meeting-timer.js";

// ─── Constants ────────────────────────────────────────────
const PLATFORM_FEE_PERCENT = 10;
const OTP_EXPIRY_MINUTES = 30; // OTP valid for 30 min after scheduled time
const MAX_OTP_ATTEMPTS = 5;
const BOOKING_ACCEPTANCE_TIMEOUT_HOURS = 24;

// ─── Helper: Generate 4-digit OTP ─────────────────────────

function generateOTP(): string {
  return crypto.randomInt(1000, 9999).toString();
}

// ─── Booking select (includes client and companion details) ─

const bookingSelect = {
  id: true,
  clientId: true,
  companionProfileId: true,
  scheduledDate: true,
  durationHours: true,
  venue: true,
  note: true,
  hourlyRate: true,
  subtotal: true,
  platformFee: true,
  totalAmount: true,
  status: true,
  otpCode: true,
  otpExpiresAt: true,
  otpVerifiedAt: true,
  otpAttempts: true,
  meetingStartedAt: true,
  meetingEndedAt: true,
  companionRespondedAt: true,
  rejectionReason: true,
  createdAt: true,
  updatedAt: true,
  client: {
    select: {
      id: true,
      fullName: true,
      avatar: true,
      phone: true,
      city: true,
    },
  },
  companionProfile: {
    select: {
      id: true,
      userId: true,
      hourlyRate: true,
      rating: true,
      user: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          phone: true,
          city: true,
        },
      },
    },
  },
};

// ─── Create Booking ───────────────────────────────────────

interface CreateBookingInput {
  clientId: string;
  companionProfileId: string;
  scheduledDate: string; // ISO date string
  durationHours: number;
  venue?: string;
  note?: string;
}

export async function createBooking(input: CreateBookingInput) {
  const { clientId, companionProfileId, scheduledDate, durationHours, venue, note } = input;

  // 1. Get companion profile
  const companion = await prisma.companionProfile.findUnique({
    where: { id: companionProfileId },
    include: { user: { select: { id: true, fullName: true } } },
  });

  if (!companion) throw new Error("Companion not found");
  if (!companion.isAvailable) throw new Error("Companion is currently unavailable");

  // 2. Prevent booking yourself
  if (clientId === companion.userId) {
    throw new Error("You cannot book yourself");
  }

  // 3. Validate scheduled date is in the future
  const schedDate = new Date(scheduledDate);
  if (schedDate <= new Date()) {
    throw new Error("Scheduled date must be in the future");
  }

  // 4. Validate duration
  if (durationHours < 1 || durationHours > 12) {
    throw new Error("Duration must be between 1 and 12 hours");
  }

  // 5. Check for overlapping bookings for this companion
  const meetingEnd = new Date(schedDate.getTime() + durationHours * 60 * 60 * 1000);
  const overlapping = await prisma.booking.findFirst({
    where: {
      companionProfileId,
      status: { in: ["CONFIRMED", "IN_PROGRESS"] },
      scheduledDate: { lt: meetingEnd },
      AND: {
        scheduledDate: {
          gte: new Date(schedDate.getTime() - 12 * 60 * 60 * 1000), // rough overlap check window
        },
      },
    },
  });

  if (overlapping) {
    throw new Error("Companion already has a booking during this time slot");
  }

  // 6. Calculate pricing (in paisa)
  const hourlyRate = companion.hourlyRate * 100; // convert ₹ to paisa
  const subtotal = hourlyRate * durationHours;
  const platformFee = Math.round(subtotal * PLATFORM_FEE_PERCENT / 100);
  const totalAmount = subtotal + platformFee;

  // 7. Hold amount from client wallet
  await walletService.holdAmount(clientId, totalAmount, "temp"); // will update bookingId after

  // 8. Create booking
  const booking = await prisma.booking.create({
    data: {
      clientId,
      companionProfileId,
      scheduledDate: schedDate,
      durationHours,
      venue,
      note,
      hourlyRate,
      subtotal,
      platformFee,
      totalAmount,
      status: "PENDING_ACCEPTANCE",
    },
    select: bookingSelect,
  });

  // 9. Update the wallet transaction with the real booking ID
  await prisma.walletTransaction.updateMany({
    where: {
      bookingId: "temp",
      type: "BOOKING_HOLD",
    },
    data: { bookingId: booking.id },
  });

  return booking;
}

// ─── Accept Booking (Companion) ───────────────────────────

export async function acceptBooking(bookingId: string, companionUserId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { companionProfile: true },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.companionProfile.userId !== companionUserId) {
    throw new Error("Only the companion can accept this booking");
  }
  if (booking.status !== "PENDING_ACCEPTANCE") {
    throw new Error(`Cannot accept booking with status: ${booking.status}`);
  }

  // Generate OTP
  const otpCode = generateOTP();
  const otpExpiresAt = new Date(
    booking.scheduledDate.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000
  );

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CONFIRMED",
      otpCode,
      otpExpiresAt,
      companionRespondedAt: new Date(),
    },
    select: bookingSelect,
  });

  return { booking: updated, otpCode };
}

// ─── Reject Booking (Companion) ───────────────────────────

export async function rejectBooking(
  bookingId: string,
  companionUserId: string,
  reason?: string
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { companionProfile: true },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.companionProfile.userId !== companionUserId) {
    throw new Error("Only the companion can reject this booking");
  }
  if (booking.status !== "PENDING_ACCEPTANCE") {
    throw new Error(`Cannot reject booking with status: ${booking.status}`);
  }

  // Release held amount
  await walletService.releaseHold(
    booking.clientId,
    booking.totalAmount,
    bookingId,
    "Booking rejected by companion"
  );

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "REJECTED",
      companionRespondedAt: new Date(),
      rejectionReason: reason || "Companion declined the booking",
    },
    select: bookingSelect,
  });

  return updated;
}

// ─── Cancel Booking (Client) ──────────────────────────────

export async function cancelBooking(bookingId: string, clientId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.clientId !== clientId) {
    throw new Error("Only the client can cancel this booking");
  }
  if (!["PENDING_ACCEPTANCE", "CONFIRMED"].includes(booking.status)) {
    throw new Error(`Cannot cancel booking with status: ${booking.status}`);
  }

  // Release held amount (full refund for now)
  await walletService.releaseHold(
    clientId,
    booking.totalAmount,
    bookingId,
    "Booking cancelled by client"
  );

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED_BY_CLIENT",
    },
    select: bookingSelect,
  });

  return updated;
}

// ─── Verify OTP (Companion starts meeting) ────────────────

export async function verifyOTP(
  bookingId: string,
  companionUserId: string,
  otpInput: string
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { companionProfile: true },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.companionProfile.userId !== companionUserId) {
    throw new Error("Only the companion can verify the OTP");
  }
  if (booking.status !== "CONFIRMED") {
    throw new Error(`Cannot verify OTP for booking with status: ${booking.status}`);
  }

  // Check max attempts
  if (booking.otpAttempts >= MAX_OTP_ATTEMPTS) {
    throw new Error("Maximum OTP attempts exceeded. Please contact support.");
  }

  // Check expiry
  if (booking.otpExpiresAt && new Date() > booking.otpExpiresAt) {
    throw new Error("OTP has expired. Please request a new one.");
  }

  // Increment attempt count
  await prisma.booking.update({
    where: { id: bookingId },
    data: { otpAttempts: { increment: 1 } },
  });

  // Verify
  if (booking.otpCode !== otpInput) {
    const remaining = MAX_OTP_ATTEMPTS - booking.otpAttempts - 1;
    throw new Error(`Invalid OTP. ${remaining} attempt(s) remaining.`);
  }

  // OTP correct → start meeting
  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "IN_PROGRESS",
      otpVerifiedAt: new Date(),
      meetingStartedAt: new Date(),
    },
    select: bookingSelect,
  });

  return updated;
}

// ─── End Meeting ──────────────────────────────────────────

export async function endMeeting(bookingId: string, companionUserId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { companionProfile: true },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.companionProfile.userId !== companionUserId) {
    throw new Error("Only the companion can end the meeting");
  }
  if (booking.status !== "IN_PROGRESS") {
    throw new Error(`Cannot end meeting with status: ${booking.status}`);
  }

  // Clear any scheduled timer warnings for this booking
  clearMeetingTimers(bookingId);

  // Settle payment: deduct from client, credit to companion
  await walletService.settleBooking(
    booking.clientId,
    booking.companionProfile.userId,
    booking.totalAmount,
    booking.platformFee,
    bookingId
  );

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "COMPLETED",
      meetingEndedAt: new Date(),
    },
    select: bookingSelect,
  });

  return updated;
}

// ─── List Bookings ────────────────────────────────────────

export async function listBookings(
  userId: string,
  statusFilter?: string,
  page: number = 1,
  limit: number = 10
) {
  // A user sees bookings where they are either the client or the companion
  const where: Record<string, unknown> = {
    OR: [
      { clientId: userId },
      { companionProfile: { userId } },
    ],
  };

  if (statusFilter && statusFilter !== "all") {
    where.status = statusFilter;
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: bookingSelect,
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Get Single Booking ───────────────────────────────────

export async function getBooking(bookingId: string, userId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: bookingSelect,
  });

  if (!booking) throw new Error("Booking not found");

  // Verify user is either client or companion
  if (
    booking.clientId !== userId &&
    booking.companionProfile.userId !== userId
  ) {
    throw new Error("Access denied");
  }

  // Strip OTP code from response if user is not the client
  // (client sees the OTP; companion enters it)
  const isClient = booking.clientId === userId;
  return {
    ...booking,
    otpCode: isClient ? booking.otpCode : null,
  };
}

// ─── Regenerate OTP ───────────────────────────────────────

export async function regenerateOTP(bookingId: string, clientId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.clientId !== clientId) {
    throw new Error("Only the client can request a new OTP");
  }
  if (booking.status !== "CONFIRMED") {
    throw new Error("OTP can only be regenerated for confirmed bookings");
  }

  const otpCode = generateOTP();
  const otpExpiresAt = new Date(
    booking.scheduledDate.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000
  );

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      otpCode,
      otpExpiresAt,
      otpAttempts: 0, // reset attempts
    },
  });

  return otpCode;
}
