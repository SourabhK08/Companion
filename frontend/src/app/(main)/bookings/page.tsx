"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Check,
  CalendarDays,
  Clock,
  MapPin,
  Star,
  BadgeCheck,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Lock,
  KeyRound,
  Play,
  Square,
  X,
  CheckCircle2,
  XCircle,
  Timer,
  Wallet,
} from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBookings, useBookingActions, type Booking } from "@/hooks/use-bookings";
import { useAuth } from "@/hooks/use-auth";

/* ─── Status Config ─── */

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  PENDING_ACCEPTANCE: { label: "Pending", bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" },
  CONFIRMED: { label: "Confirmed", bg: "bg-sky-50", text: "text-sky-600", dot: "bg-sky-500" },
  REJECTED: { label: "Rejected", bg: "bg-red-50", text: "text-red-500", dot: "bg-red-400" },
  CANCELLED_BY_CLIENT: { label: "Cancelled", bg: "bg-red-50", text: "text-red-500", dot: "bg-red-400" },
  IN_PROGRESS: { label: "In Progress", bg: "bg-purple-50", text: "text-purple-600", dot: "bg-purple-500" },
  COMPLETED: { label: "Completed", bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" },
  EXPIRED: { label: "Expired", bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-400" },
  DISPUTED: { label: "Disputed", bg: "bg-orange-50", text: "text-orange-500", dot: "bg-orange-400" },
};

const tabs = [
  { key: "all", label: "All" },
  { key: "PENDING_ACCEPTANCE", label: "Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED", label: "Completed" },
];

/* ─── OTP Display (for client) ─── */

function OTPDisplay({ otpCode }: { otpCode: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4">
      <div className="flex size-10 items-center justify-center rounded-full bg-sky-100">
        <KeyRound className="size-5 text-sky-600" />
      </div>
      <div>
        <p className="text-xs font-semibold text-sky-700">Your Meeting OTP</p>
        <p className="text-2xl font-black tracking-[0.3em] text-sky-900">{otpCode}</p>
        <p className="text-[10px] text-sky-600">Share this code with your companion when you meet.</p>
      </div>
    </div>
  );
}

/* ─── OTP Input (for companion) ─── */

function OTPInput({ bookingId, onSuccess }: { bookingId: string; onSuccess: () => void }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { verifyOTP, isSubmitting } = useBookingActions();

  const handleVerify = async () => {
    setError(null);
    try {
      const res = await verifyOTP(bookingId, otp);
      if (res.success) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed");
    }
  };

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <KeyRound className="size-4 text-emerald-600" />
        <p className="text-sm font-bold text-emerald-800">Enter Client&apos;s OTP to Start Meeting</p>
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          maxLength={4}
          placeholder="Enter 4-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
          className="h-10 flex-1 rounded-lg border-emerald-200 text-center text-lg font-bold tracking-[0.3em]"
        />
        <Button
          onClick={handleVerify}
          disabled={otp.length !== 4 || isSubmitting}
          className="h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4"
        >
          {isSubmitting ? "..." : "Verify"}
        </Button>
      </div>
      {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}

/* ─── Booking Card ─── */

function BookingCard({
  booking,
  currentUserId,
  onRefresh,
}: {
  booking: Booking;
  currentUserId: string;
  onRefresh: () => void;
}) {
  const { acceptBooking, rejectBooking, cancelBooking, endMeeting, isSubmitting } = useBookingActions();
  const [actionError, setActionError] = useState<string | null>(null);

  const isClient = booking.clientId === currentUserId;
  const isCompanion = booking.companionProfile.userId === currentUserId;
  const cfg = statusConfig[booking.status] || statusConfig.PENDING_ACCEPTANCE;

  const otherPerson = isClient
    ? booking.companionProfile.user
    : booking.client;

  const scheduledDate = new Date(booking.scheduledDate);
  const dateStr = scheduledDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeStr = scheduledDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleAction = async (action: () => Promise<unknown>) => {
    setActionError(null);
    try {
      await action();
      onRefresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    }
  };

  return (
    <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-12 shrink-0 overflow-hidden rounded-full border border-soft-border bg-gradient-to-br from-dusty-rose to-berry flex items-center justify-center text-white text-sm font-bold">
            {otherPerson.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={otherPerson.avatar}
                alt={otherPerson.fullName}
                className="size-full object-cover"
              />
            ) : (
              otherPerson.fullName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-foreground">{otherPerson.fullName}</h3>
              <span className="text-[10px] text-muted-foreground">
                ({isClient ? "Companion" : "Client"})
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{otherPerson.city || "Kolkata"}</p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold",
            cfg.bg,
            cfg.text
          )}
        >
          <span className={cn("size-1.5 rounded-full", cfg.dot)} />
          {cfg.label}
        </span>
      </div>

      {/* Details Row */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3 text-berry" />
          {dateStr}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3 text-berry" />
          {timeStr} · {booking.durationHours}h
        </div>
        {booking.venue && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3 text-berry" />
            {booking.venue}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Wallet className="size-3 text-berry" />
          ₹{(booking.totalAmount / 100).toLocaleString("en-IN")}
        </div>
      </div>

      {/* Note */}
      {booking.note && (
        <p className="mt-2 text-xs italic text-muted-foreground border-l-2 border-berry/20 pl-3">
          &ldquo;{booking.note}&rdquo;
        </p>
      )}

      {/* ─── OTP Section ─── */}
      {booking.status === "CONFIRMED" && isClient && booking.otpCode && (
        <div className="mt-4">
          <OTPDisplay otpCode={booking.otpCode} />
        </div>
      )}

      {booking.status === "CONFIRMED" && isCompanion && (
        <div className="mt-4">
          <OTPInput bookingId={booking.id} onSuccess={onRefresh} />
        </div>
      )}

      {/* ─── Meeting In Progress ─── */}
      {booking.status === "IN_PROGRESS" && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-purple-200 bg-purple-50 p-4">
          <div className="flex size-8 items-center justify-center rounded-full bg-purple-100">
            <Play className="size-4 text-purple-600" fill="currentColor" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-purple-800">Meeting in Progress</p>
            <p className="text-[10px] text-purple-600">
              Started at {booking.meetingStartedAt ? new Date(booking.meetingStartedAt).toLocaleTimeString("en-IN") : "N/A"}
            </p>
          </div>
          {isCompanion && (
            <Button
              onClick={() => handleAction(() => endMeeting(booking.id))}
              disabled={isSubmitting}
              className="h-9 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
            >
              <Square className="size-3 mr-1" fill="currentColor" />
              End Meeting
            </Button>
          )}
        </div>
      )}

      {/* ─── Completed ─── */}
      {booking.status === "COMPLETED" && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <p className="text-xs font-semibold text-emerald-700">Meeting completed. Payment settled.</p>
        </div>
      )}

      {/* ─── Rejected ─── */}
      {booking.status === "REJECTED" && booking.rejectionReason && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
          <XCircle className="size-4 text-red-500" />
          <p className="text-xs text-red-600">
            <span className="font-semibold">Reason:</span> {booking.rejectionReason}
          </p>
        </div>
      )}

      {/* ─── Action Buttons ─── */}
      {actionError && (
        <p className="mt-2 text-xs font-semibold text-red-600">{actionError}</p>
      )}

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        {/* Companion: Accept/Reject pending booking */}
        {booking.status === "PENDING_ACCEPTANCE" && isCompanion && (
          <>
            <Button
              onClick={() => handleAction(() => acceptBooking(booking.id))}
              disabled={isSubmitting}
              className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4"
            >
              <Check className="size-3 mr-1" />
              Accept
            </Button>
            <Button
              onClick={() => handleAction(() => rejectBooking(booking.id))}
              disabled={isSubmitting}
              variant="outline"
              className="h-8 rounded-lg border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold px-4"
            >
              <X className="size-3 mr-1" />
              Reject
            </Button>
          </>
        )}

        {/* Client: Cancel pending/confirmed booking */}
        {(booking.status === "PENDING_ACCEPTANCE" || booking.status === "CONFIRMED") && isClient && (
          <Button
            onClick={() => handleAction(() => cancelBooking(booking.id))}
            disabled={isSubmitting}
            variant="outline"
            className="h-8 rounded-lg border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold px-4"
          >
            <X className="size-3 mr-1" />
            Cancel Booking
          </Button>
        )}

        {/* Pending indicator for client */}
        {booking.status === "PENDING_ACCEPTANCE" && isClient && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600">
            <Timer className="size-3 animate-pulse" />
            Waiting for companion to accept...
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Bookings Content ─── */

function BookingsContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { bookings, pagination, isLoading, refetch } = useBookings(
    activeTab as "all" | "PENDING_ACCEPTANCE" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED",
    page
  );

  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      {/* Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your booking requests, meetings, and history.
          </p>
        </div>
        <Link
          href="/explore"
          className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-full bg-berry text-white px-5 text-sm font-semibold hover:bg-berry-dark"
        >
          Book New <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-berry text-white"
                : "border border-soft-border bg-white text-muted-foreground hover:bg-muted"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Booking List */}
      <div className="mt-5 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="size-8 animate-spin rounded-full border-4 border-[#f0dfe3] border-t-berry" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CalendarDays className="size-12 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-bold text-foreground">No bookings yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore companions and book your first experience!
            </p>
            <Link
              href="/explore"
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-berry text-white px-6 text-sm font-semibold hover:bg-berry-dark"
            >
              Explore Companions <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              currentUserId={user.id}
              onRefresh={refetch}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="h-9 rounded-lg text-xs"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="h-9 rounded-lg text-xs"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * My Bookings page — Dynamic version.
 *
 * Shows:
 *   1. Status-filtered tabs (All / Pending / Confirmed / In Progress / Completed)
 *   2. Booking cards with actions (accept, reject, cancel, OTP, end meeting)
 *   3. OTP display for clients / OTP input for companions
 *   4. Real-time updates via Socket.IO
 */
export default function BookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[60vh] items-center justify-center">
          <div className="size-10 animate-spin rounded-full border-4 border-[#f0dfe3] border-t-[#7a1f39]" />
        </div>
      }
    >
      <BookingsContent />
    </Suspense>
  );
}
