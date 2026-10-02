"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api/client";
import { useSocket } from "@/providers/socket-provider";

// ─── Types ────────────────────────────────────────────────

export interface BookingCompanionUser {
  id: string;
  fullName: string;
  avatar: string | null;
  phone: string | null;
  city: string | null;
}

export interface BookingCompanionProfile {
  id: string;
  userId: string;
  hourlyRate: number;
  rating: number;
  user: BookingCompanionUser;
}

export interface BookingClient {
  id: string;
  fullName: string;
  avatar: string | null;
  phone: string | null;
  city: string | null;
}

export interface Booking {
  id: string;
  clientId: string;
  companionProfileId: string;
  scheduledDate: string;
  durationHours: number;
  venue: string | null;
  note: string | null;
  hourlyRate: number;
  subtotal: number;
  platformFee: number;
  totalAmount: number;
  status: string;
  otpCode: string | null;
  otpExpiresAt: string | null;
  otpVerifiedAt: string | null;
  otpAttempts: number;
  meetingStartedAt: string | null;
  meetingEndedAt: string | null;
  companionRespondedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  client: BookingClient;
  companionProfile: BookingCompanionProfile;
}

type BookingStatus = "all" | "PENDING_ACCEPTANCE" | "CONFIRMED" | "REJECTED" | "CANCELLED_BY_CLIENT" | "IN_PROGRESS" | "COMPLETED" | "EXPIRED";

// ─── useBookings Hook ─────────────────────────────────────

export function useBookings(statusFilter: BookingStatus = "all", page: number = 1) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket();

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("limit", "10");

      const res = await apiFetch<{
        success: boolean;
        data: {
          bookings: Booking[];
          pagination: { page: number; limit: number; total: number; totalPages: number };
        };
      }>(`/api/bookings?${params.toString()}`);

      if (res.success) {
        setBookings(res.data.bookings);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Listen for real-time booking events to auto-refresh
  useEffect(() => {
    if (!socket) return;

    const refreshEvents = [
      "booking_request",
      "booking_confirmed",
      "booking_rejected",
      "booking_cancelled",
      "meeting_started",
      "meeting_completed",
    ];

    const handleRefresh = () => {
      fetchBookings();
    };

    for (const event of refreshEvents) {
      socket.on(event, handleRefresh);
    }

    return () => {
      for (const event of refreshEvents) {
        socket.off(event, handleRefresh);
      }
    };
  }, [socket, fetchBookings]);

  return { bookings, pagination, isLoading, error, refetch: fetchBookings };
}

// ─── useBooking (single booking) ──────────────────────────

export function useBooking(bookingId: string | null) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket();

  const fetchBooking = useCallback(async () => {
    if (!bookingId) {
      setBooking(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ success: boolean; data: { booking: Booking } }>(
        `/api/bookings/${bookingId}`
      );
      if (res.success) {
        setBooking(res.data.booking);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch booking");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  // Auto-refresh on booking events
  useEffect(() => {
    if (!socket || !bookingId) return;

    const refreshEvents = [
      "booking_confirmed",
      "booking_rejected",
      "meeting_started",
      "meeting_completed",
    ];

    const handleRefresh = () => {
      fetchBooking();
    };

    for (const event of refreshEvents) {
      socket.on(event, handleRefresh);
    }

    return () => {
      for (const event of refreshEvents) {
        socket.off(event, handleRefresh);
      }
    };
  }, [socket, bookingId, fetchBooking]);

  return { booking, isLoading, error, refetch: fetchBooking };
}

// ─── Booking Actions ──────────────────────────────────────

export function useBookingActions() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createBooking = useCallback(async (data: {
    companionProfileId: string;
    scheduledDate: string;
    durationHours: number;
    venue?: string;
    note?: string;
  }) => {
    setIsSubmitting(true);
    try {
      const res = await apiFetch<{ success: boolean; data: { booking: Booking }; message: string }>(
        "/api/bookings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      return res;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const acceptBooking = useCallback(async (bookingId: string) => {
    setIsSubmitting(true);
    try {
      return await apiFetch<{ success: boolean; data: { booking: Booking }; message: string }>(
        `/api/bookings/${bookingId}/accept`,
        { method: "PATCH" }
      );
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const rejectBooking = useCallback(async (bookingId: string, reason?: string) => {
    setIsSubmitting(true);
    try {
      return await apiFetch<{ success: boolean; data: { booking: Booking }; message: string }>(
        `/api/bookings/${bookingId}/reject`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const cancelBooking = useCallback(async (bookingId: string) => {
    setIsSubmitting(true);
    try {
      return await apiFetch<{ success: boolean; data: { booking: Booking }; message: string }>(
        `/api/bookings/${bookingId}/cancel`,
        { method: "PATCH" }
      );
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const verifyOTP = useCallback(async (bookingId: string, otp: string) => {
    setIsSubmitting(true);
    try {
      return await apiFetch<{ success: boolean; data: { booking: Booking }; message: string }>(
        `/api/bookings/${bookingId}/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp }),
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const endMeeting = useCallback(async (bookingId: string) => {
    setIsSubmitting(true);
    try {
      return await apiFetch<{ success: boolean; data: { booking: Booking }; message: string }>(
        `/api/bookings/${bookingId}/end`,
        { method: "PATCH" }
      );
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    isSubmitting,
    createBooking,
    acceptBooking,
    rejectBooking,
    cancelBooking,
    verifyOTP,
    endMeeting,
  };
}
