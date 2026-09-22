/**
 * Mock data for the My Bookings / Checkout page.
 *
 * ⚠️  DEV ONLY — All data here is static/hardcoded for UI development.
 * Replace with real API calls when backend is ready.
 *
 * Matches: GET /api/bookings/:id
 */

export interface BookingCompanion {
  id: string;
  name: string;
  age: number;
  city: string;
  rating: number;
  reviews: number;
  languages: string[];
  avatar: string | null;
  isVerified: boolean;
}

export interface BookingDetails {
  id: string;
  experienceTitle: string;
  companion: BookingCompanion;
  tags: string[];
  description: string;
  date: string;
  time: string;
  duration: string;
  venue: string;
  city: string;
  basePrice: number;
  platformFeePercent: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  step: 1 | 2 | 3; // 1=details, 2=payment, 3=confirmation
}

export const currentBooking: BookingDetails = {
  id: "bk-001",
  experienceTitle: "Coffee Experience",
  companion: {
    id: "mc-ananya",
    name: "Ananya Sharma",
    age: 24,
    city: "Kolkata",
    rating: 4.9,
    reviews: 124,
    languages: ["English", "Hindi", "Bengali"],
    avatar: null,
    isVerified: true,
  },
  tags: ["Food Walk", "Café Hopping", "Photography", "Travel"],
  description:
    "Enjoy a relaxed coffee experience, great conversation and discover new perspectives.",
  date: "Sat, 28 Jun 2025",
  time: "5:30 PM – 7:30 PM",
  duration: "2 hours",
  venue: "Park Street Cafe",
  city: "Kolkata",
  basePrice: 799,
  platformFeePercent: 5,
  status: "pending",
  step: 2,
};

export const paymentMethods = [
  {
    id: "upi",
    label: "UPI (Google Pay / PhonePe / Paytm)",
    icon: "upi" as const,
    recommended: true,
  },
  { id: "card", label: "Credit / Debit Card", icon: "card" as const, recommended: false },
  {
    id: "wallet",
    label: "Wallet (Paytm / PhonePe)",
    icon: "wallet" as const,
    recommended: false,
  },
  { id: "netbanking", label: "Net Banking", icon: "bank" as const, recommended: false },
] as const;

export const verificationBadges = [
  { label: "ID Verified", description: "Government ID checked" },
  { label: "Photo Verified", description: "Real photos, not fake" },
  { label: "Background Checked", description: "Basic verification for safety" },
  { label: "Community Reviewed", description: "Maintained through user feedback" },
] as const;
