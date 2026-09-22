/**
 * Mock data for the Saved Companions page.
 *
 * ⚠️  DEV ONLY — Replace with real API calls when backend is ready.
 * Matches: GET /api/users/me/saved-companions
 */

export interface SavedCompanion {
  id: string;
  name: string;
  age: number;
  city: string;
  rating: number;
  reviews: number;
  interests: string[];
  bio: string;
  avatar: string | null;
  isVerified: boolean;
  isOnline: boolean;
}

export const savedCompanions: SavedCompanion[] = [
  {
    id: "sc-001",
    name: "Ananya Sharma",
    age: 24,
    city: "Kolkata",
    rating: 4.9,
    reviews: 124,
    interests: ["Food Walk", "Café Hopping", "Photography"],
    bio: "Love exploring new places, trying different cuisines and capturing beautiful moments.",
    avatar: null,
    isVerified: true,
    isOnline: true,
  },
  {
    id: "sc-002",
    name: "Isha Verma",
    age: 22,
    city: "Bangalore",
    rating: 4.8,
    reviews: 98,
    interests: ["Travel", "Photography", "Adventure"],
    bio: "Traveling is my happy place. Always up for new adventures and great conversations.",
    avatar: null,
    isVerified: true,
    isOnline: false,
  },
  {
    id: "sc-003",
    name: "Tiya Ghosh",
    age: 26,
    city: "Kolkata",
    rating: 4.7,
    reviews: 76,
    interests: ["Music", "Food", "Nature"],
    bio: "Good food, great music and meaningful conversations make me happy.",
    avatar: null,
    isVerified: true,
    isOnline: true,
  },
  {
    id: "sc-004",
    name: "Rohan Das",
    age: 27,
    city: "Kolkata",
    rating: 4.6,
    reviews: 62,
    interests: ["Sports", "Fitness", "Movies"],
    bio: "Fitness, cricket and good vibes — that's my kind of day!",
    avatar: null,
    isVerified: true,
    isOnline: false,
  },
  {
    id: "sc-005",
    name: "Priya Singh",
    age: 25,
    city: "Delhi",
    rating: 4.5,
    reviews: 48,
    interests: ["Photography", "Art", "Travel"],
    bio: "Art, coffee and new experiences are my happy pills.",
    avatar: null,
    isVerified: true,
    isOnline: false,
  },
  {
    id: "sc-006",
    name: "Debanjan Mitra",
    age: 28,
    city: "Kolkata",
    rating: 4.4,
    reviews: 36,
    interests: ["Business", "Travel", "Food"],
    bio: "Always up for meaningful conversations and new experiences.",
    avatar: null,
    isVerified: true,
    isOnline: true,
  },
];

export const recentlyViewed = [
  { id: "sc-002", name: "Isha Verma", age: 22, city: "Bangalore", isOnline: true },
  { id: "sc-003", name: "Tiya Ghosh", age: 26, city: "Kolkata", isOnline: true },
  { id: "sc-004", name: "Rohan Das", age: 27, city: "Kolkata", isOnline: true },
  { id: "sc-005", name: "Priya Singh", age: 25, city: "Delhi", isOnline: true },
  { id: "sc-001", name: "Ananya Sharma", age: 24, city: "Kolkata", isOnline: true },
];
