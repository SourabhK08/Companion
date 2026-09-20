/**
 * Dashboard mock data.
 *
 * ⚠️  DEV ONLY — All data here is static/hardcoded for UI development.
 * Replace with real API calls when backend is ready.
 */

/* ─── User ─── */

export const mockUser = {
  name: "Rahul Sharma",
  email: "rahul.sharma@email.com",
  avatar: null as string | null, // placeholder — replace with real avatar URL
  isVerified: true,
  city: "Kolkata",
} as const;

/* ─── Stats ─── */

export const dashboardStats = [
  {
    label: "Total Bookings",
    value: "12",
    change: "↑ 2 this month",
    icon: "calendar-check" as const,
  },
  {
    label: "Completed Sessions",
    value: "8",
    change: "↑ 1 this month",
    icon: "check-circle" as const,
  },
  {
    label: "Saved Companions",
    value: "17",
    change: "↑ 3 this month",
    icon: "heart" as const,
  },
  {
    label: "Trust Score",
    value: "98%",
    change: "Excellent",
    icon: "shield-check" as const,
  },
] as const;

/* ─── Next Booking ─── */

export const nextBooking = {
  title: "Coffee Experience",
  companion: "Ananya Sharma",
  companionVerified: true,
  status: "Confirmed" as const,
  date: "Sat, 28 Jun 2025",
  time: "5:30 PM – 7:30 PM",
  location: "Park Street Cafe, Kolkata",
  tags: ["Verified", "Non-Sexual", "Public Location"] as const,
  description:
    "Enjoy a relaxed coffee experience, great conversation and discover new perspectives.",
  image: null as string | null, // placeholder
};

/* ─── Recommended Experiences ─── */

export const recommendedExperiences = [
  {
    title: "Food Walk",
    category: "Food & Drinks",
    city: "Kolkata",
    price: 799,
    image: null as string | null,
    gradient: "from-amber-700 via-orange-600 to-red-700",
  },
  {
    title: "Photography Walk",
    category: "Photography",
    city: "Kolkata",
    price: 999,
    image: null as string | null,
    gradient: "from-emerald-700 via-teal-600 to-cyan-700",
  },
  {
    title: "Puja Buddy",
    category: "Cultural",
    city: "Kolkata",
    price: 1299,
    image: null as string | null,
    gradient: "from-purple-700 via-violet-600 to-indigo-700",
  },
  {
    title: "Museum Tour",
    category: "Heritage",
    city: "Kolkata",
    price: 699,
    image: null as string | null,
    gradient: "from-rose-700 via-pink-600 to-fuchsia-700",
  },
] as const;

/* ─── Recent Activity ─── */

export const recentActivity = [
  {
    icon: "calendar-check" as const,
    title: "Booking Confirmed",
    description: "Coffee Experience with Ananya Sharma",
    time: "Today, 10:24 AM",
    color: "text-emerald-600" as const,
  },
  {
    icon: "credit-card" as const,
    title: "Payment Successful",
    description: "₹999 via UPI",
    time: "Today, 10:18 AM",
    color: "text-blue-600" as const,
  },
  {
    icon: "star" as const,
    title: "Review Submitted",
    description: "You rated 5 stars for Riya Kapoor",
    time: "Yesterday, 7:45 PM",
    color: "text-amber-600" as const,
  },
  {
    icon: "shield-check" as const,
    title: "Identity Verified",
    description: "Your KYC verification is complete",
    time: "Yesterday, 6:30 PM",
    color: "text-violet-600" as const,
  },
] as const;

/* ─── Saved Companions ─── */

export const savedCompanions = [
  {
    name: "Ananya Sharma",
    rating: 4.9,
    reviews: 124,
    languages: "English, Hindi",
    interests: "Food, Travel, Photography",
    avatar: null as string | null,
  },
  {
    name: "Riya Kapoor",
    rating: 4.8,
    reviews: 98,
    languages: "English, Bengali",
    interests: "Art, Culture, Travel",
    avatar: null as string | null,
  },
  {
    name: "Isha Verma",
    rating: 4.7,
    reviews: 76,
    languages: "Hindi, English",
    interests: "Fitness, Music, Food",
    avatar: null as string | null,
  },
] as const;

/* ─── Messages ─── */

export const recentMessages = [
  {
    name: "Ananya Sharma",
    message: "See you tomorrow! 😊",
    time: "10:24 AM",
    unread: 2,
    avatar: null as string | null,
  },
  {
    name: "Support Team",
    message: "Your verification completed.",
    time: "Yesterday",
    unread: 1,
    avatar: null as string | null,
  },
  {
    name: "Riya Kapoor",
    message: "Thanks for the great experience!",
    time: "2 days ago",
    unread: 0,
    avatar: null as string | null,
  },
] as const;

/* ─── Wallet ─── */

export const walletData = {
  balance: 1250,
  promoCredits: 300,
} as const;
