/**
 * Mock data for the Explore Upcoming Offline Events page.
 *
 * ⚠️  DEV ONLY — All data here is static/hardcoded for UI development.
 * Replace with real API calls when backend is ready.
 *
 * Each event object maps to the API response shape:
 *   GET /api/events?city=kolkata&page=1&limit=6
 */

export interface Event {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  pricePerPerson: number;
  date: string;
  time: string;
  venue: string;
  city: string;
  attendeesGoing: number;
  attendeeAvatars: number;
  image: string | null;
  isFeatured: boolean;
}

export const upcomingEvents: Event[] = [
  {
    id: "evt-001",
    title: "Sunset Rooftop Mixer",
    subtitle: "Good vibes, great people, and stunning views.",
    category: "Social",
    pricePerPerson: 499,
    date: "Sat, 26 Apr 2025",
    time: "5:00 PM – 10:00 PM",
    venue: "The Park Hotel, Kolkata",
    city: "Kolkata",
    attendeesGoing: 24,
    attendeeAvatars: 8,
    image: null,
    isFeatured: false,
  },
  {
    id: "evt-002",
    title: "Weekend Getaway – Darjeeling",
    subtitle: "Mountains, coffee, and new stories.",
    category: "Travel",
    pricePerPerson: 3499,
    date: "Fri, 16 May 2025",
    time: "6:00 AM – 9:00 PM",
    venue: "Darjeeling",
    city: "Darjeeling",
    attendeesGoing: 18,
    attendeeAvatars: 12,
    image: null,
    isFeatured: false,
  },
  {
    id: "evt-003",
    title: "Sip & Paint Night",
    subtitle: "Create, connect, and unwind.",
    category: "Art & Culture",
    pricePerPerson: 1200,
    date: "Sat, 3 May 2025",
    time: "5:00 PM – 8:00 PM",
    venue: "Art Loop Studio, Kolkata",
    city: "Kolkata",
    attendeesGoing: 18,
    attendeeAvatars: 10,
    image: null,
    isFeatured: false,
  },
  {
    id: "evt-004",
    title: "Yoga & Mindfulness Retreat",
    subtitle: "Breathe. Move. Be You.",
    category: "Wellness",
    pricePerPerson: 1800,
    date: "Sun, 11 May 2025",
    time: "7:00 AM – 10:00 AM",
    venue: "Eco Park, Kolkata",
    city: "Kolkata",
    attendeesGoing: 12,
    attendeeAvatars: 9,
    image: null,
    isFeatured: false,
  },
  {
    id: "evt-005",
    title: "Food Trail – Park Street",
    subtitle: "Eat. Explore. Connect.",
    category: "Food & Drink",
    pricePerPerson: 1000,
    date: "Sat, 24 May 2025",
    time: "4:00 PM – 8:00 PM",
    venue: "Park Street, Kolkata",
    city: "Kolkata",
    attendeesGoing: 26,
    attendeeAvatars: 6,
    image: null,
    isFeatured: false,
  },
  {
    id: "evt-006",
    title: "Gaming Night – LAN Party",
    subtitle: "Play. Compete. Make Friends.",
    category: "Gaming",
    pricePerPerson: 650,
    date: "Fri, 9 May 2025",
    time: "6:00 PM – 11:00 PM",
    venue: "Level Up Café, Kolkata",
    city: "Kolkata",
    attendeesGoing: 12,
    attendeeAvatars: 11,
    image: null,
    isFeatured: false,
  },
];

/** Event category filters with icons. */
export const eventCategories = [
  "All Events",
  "Social",
  "Travel",
  "Wellness",
  "Food & Drink",
  "Arts & Culture",
  "Sports",
  "Gaming",
  "Workshops",
  "Other",
] as const;

/** Event type filters (checkbox sidebar). */
export const eventTypeFilters = [
  "Social",
  "Travel",
  "Wellness",
  "Food & Drink",
  "Art & Culture",
  "Sports",
  "Gaming",
  "Workshops",
  "Other",
] as const;

/** Category badge color map. */
export const categoryColors: Record<string, { bg: string; text: string }> = {
  Social: { bg: "bg-amber-100", text: "text-amber-800" },
  Travel: { bg: "bg-sky-100", text: "text-sky-800" },
  "Art & Culture": { bg: "bg-violet-100", text: "text-violet-800" },
  "Arts & Culture": { bg: "bg-violet-100", text: "text-violet-800" },
  Wellness: { bg: "bg-emerald-100", text: "text-emerald-800" },
  "Food & Drink": { bg: "bg-rose-100", text: "text-rose-800" },
  Gaming: { bg: "bg-indigo-100", text: "text-indigo-800" },
  Sports: { bg: "bg-orange-100", text: "text-orange-800" },
  Workshops: { bg: "bg-teal-100", text: "text-teal-800" },
  Other: { bg: "bg-gray-100", text: "text-gray-800" },
};
