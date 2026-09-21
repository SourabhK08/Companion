/**
 * Mock data for the Explore Male Dating Companions page.
 *
 * ⚠️  DEV ONLY — All data here is static/hardcoded for UI development.
 * Replace with real API calls when backend is ready.
 *
 * Each companion object maps to the API response shape:
 *   GET /api/companions?gender=male&page=1&limit=8
 */

export interface Companion {
  id: string;
  name: string;
  age: number;
  profession: string;
  city: string;
  interests: string[];
  pricePerHour: number;
  rating: number;
  reviews: number;
  responseRate: number;
  isVerified: boolean;
  avatar: string | null;
  bio: string;
  languages: string[];
  gender: "male" | "female" | "other";
}

export const maleCompanions: Companion[] = [
  {
    id: "mc-001",
    name: "Arjun Mehta",
    age: 28,
    profession: "Marketing Professional",
    city: "Kolkata",
    interests: ["Travel", "Food", "Movies"],
    pricePerHour: 2500,
    rating: 4.8,
    reviews: 112,
    responseRate: 95,
    isVerified: true,
    avatar: null,
    bio: "Loves exploring local food joints and sharing travel stories.",
    languages: ["English", "Hindi", "Bengali"],
    gender: "male",
  },
  {
    id: "mc-002",
    name: "Rohan Sharma",
    age: 32,
    profession: "Entrepreneur",
    city: "Kolkata",
    interests: ["Business", "Travel", "Fitness"],
    pricePerHour: 3000,
    rating: 4.9,
    reviews: 87,
    responseRate: 92,
    isVerified: true,
    avatar: null,
    bio: "Passionate about business conversations and fitness routines.",
    languages: ["English", "Hindi"],
    gender: "male",
  },
  {
    id: "mc-003",
    name: "Karan Singh",
    age: 26,
    profession: "Software Engineer",
    city: "Kolkata",
    interests: ["Gaming", "Music", "Travel"],
    pricePerHour: 2200,
    rating: 4.7,
    reviews: 64,
    responseRate: 98,
    isVerified: true,
    avatar: null,
    bio: "Tech enthusiast who enjoys gaming sessions and live music.",
    languages: ["English", "Hindi", "Punjabi"],
    gender: "male",
  },
  {
    id: "mc-004",
    name: "Siddharth Kapoor",
    age: 30,
    profession: "Lawyer",
    city: "Kolkata",
    interests: ["Debates", "Books", "Dining"],
    pricePerHour: 3500,
    rating: 4.9,
    reviews: 98,
    responseRate: 94,
    isVerified: true,
    avatar: null,
    bio: "Thoughtful conversationalist with a passion for fine dining.",
    languages: ["English", "Hindi"],
    gender: "male",
  },
  {
    id: "mc-005",
    name: "Aman Verma",
    age: 27,
    profession: "Fitness Coach",
    city: "Kolkata",
    interests: ["Fitness", "Sports", "Adventure"],
    pricePerHour: 2800,
    rating: 4.8,
    reviews: 76,
    responseRate: 97,
    isVerified: true,
    avatar: null,
    bio: "Adventure lover who combines fitness with meaningful experiences.",
    languages: ["English", "Hindi"],
    gender: "male",
  },
  {
    id: "mc-006",
    name: "Vikram Desai",
    age: 34,
    profession: "Photographer",
    city: "Kolkata",
    interests: ["Photography", "Travel", "Art"],
    pricePerHour: 3200,
    rating: 4.7,
    reviews: 53,
    responseRate: 90,
    isVerified: true,
    avatar: null,
    bio: "Captures moments and stories through the lens of creativity.",
    languages: ["English", "Hindi", "Gujarati"],
    gender: "male",
  },
  {
    id: "mc-007",
    name: "Kabir Khan",
    age: 29,
    profession: "Business Analyst",
    city: "Kolkata",
    interests: ["Business", "Technology", "Music"],
    pricePerHour: 2600,
    rating: 4.6,
    reviews: 42,
    responseRate: 93,
    isVerified: true,
    avatar: null,
    bio: "Analytical mind with a creative soul — loves tech and music.",
    languages: ["English", "Hindi", "Urdu"],
    gender: "male",
  },
  {
    id: "mc-008",
    name: "Dev Patel",
    age: 31,
    profession: "Event Host",
    city: "Kolkata",
    interests: ["Social", "Travel", "Food"],
    pricePerHour: 3000,
    rating: 4.8,
    reviews: 89,
    responseRate: 96,
    isVerified: true,
    avatar: null,
    bio: "Natural entertainer who makes every gathering unforgettable.",
    languages: ["English", "Hindi", "Bengali"],
    gender: "male",
  },
];

/** Category filter tabs matching the reference design. */
export const companionCategories = [
  "All Men",
  "Dating",
  "Hangout",
  "Travel",
  "Dinner",
  "Events",
  "Fitness",
  "Creative",
  "Professional",
  "More",
] as const;

/** Interest filter options (checkbox list). */
export const interestFilters = [
  "Dating",
  "Travel",
  "Food & Dining",
  "Movies",
  "Music",
  "Sports",
  "Fitness",
  "Art & Culture",
  "Business",
  "Gaming",
  "More",
] as const;

/** Trust badges for the hero section. */
export const exploreTrustBadges = [
  { icon: "shield-check", label: "Verified Profiles", description: "(100% Genuine)" },
  { icon: "lock", label: "Safe & Discreet", description: "Your Privacy Matters" },
  { icon: "heart", label: "Respectful", description: "& Well-Mannered" },
  { icon: "age", label: "18+ Only", description: "(Verified Age)" },
] as const;

/** Value propositions row. */
export const exploreValueProps = [
  { icon: "shield-check", title: "100% Verified", description: "ID & profile verification" },
  { icon: "lock", title: "Discreet & Private", description: "Your data stays safe" },
  { icon: "calendar", title: "Flexible Bookings", description: "Choose what suits you" },
  { icon: "users", title: "Real People", description: "Meaningful experiences" },
] as const;
