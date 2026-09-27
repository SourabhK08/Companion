import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seed script: creates 24 sample users with companion profiles
 * across male, female, and non-binary genders so the explore
 * pages have data immediately.
 *
 * Run: npm run db:seed
 */

const SALT_ROUNDS = 12;
const DEFAULT_PASSWORD = "Password@123";

interface SeedCompanion {
  fullName: string;
  email: string;
  gender: string;
  city: string;
  bio: string;
  interests: string[];
  languages: string[];
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  responseRate: number;
}

const companions: SeedCompanion[] = [
  // ─── Male Companions (8) ────────────────────────────────
  {
    fullName: "Arjun Mehta",
    email: "arjun.mehta@modhuralap.dev",
    gender: "male",
    city: "Kolkata",
    bio: "Passionate about art, deep conversations and city walks. Let's explore the hidden gems of Kolkata together over chai!",
    interests: ["Art", "Poetry", "City Walks", "Photography", "Chai"],
    languages: ["Hindi", "English", "Bengali"],
    hourlyRate: 500,
    rating: 4.9,
    reviewCount: 47,
    responseRate: 98,
  },
  {
    fullName: "Rohan Das",
    email: "rohan.das@modhuralap.dev",
    gender: "male",
    city: "Kolkata",
    bio: "Music lover, guitarist, and a great listener. I believe every person has a story worth hearing.",
    interests: ["Music", "Guitar", "Movies", "Cooking", "Travel"],
    languages: ["Bengali", "English", "Hindi"],
    hourlyRate: 400,
    rating: 4.7,
    reviewCount: 32,
    responseRate: 95,
  },
  {
    fullName: "Vikram Chatterjee",
    email: "vikram.c@modhuralap.dev",
    gender: "male",
    city: "Kolkata",
    bio: "Fitness enthusiast and book nerd. Looking to share meaningful moments and explore interesting cafes.",
    interests: ["Fitness", "Books", "Cafes", "Running", "Philosophy"],
    languages: ["English", "Hindi", "Bengali"],
    hourlyRate: 600,
    rating: 4.8,
    reviewCount: 55,
    responseRate: 99,
  },
  {
    fullName: "Sourav Banerjee",
    email: "sourav.b@modhuralap.dev",
    gender: "male",
    city: "Kolkata",
    bio: "Cricket fanatic, chai connoisseur, and your go-to companion for lively evening conversations.",
    interests: ["Cricket", "Tea", "Conversations", "Board Games", "Movies"],
    languages: ["Bengali", "English"],
    hourlyRate: 350,
    rating: 4.6,
    reviewCount: 28,
    responseRate: 92,
  },
  {
    fullName: "Aditya Roy",
    email: "aditya.r@modhuralap.dev",
    gender: "male",
    city: "Kolkata",
    bio: "Theater artist and storyteller. Every meeting with me is an experience filled with humor and warmth.",
    interests: ["Theater", "Comedy", "Storytelling", "Dancing", "Street Food"],
    languages: ["Hindi", "Bengali", "English"],
    hourlyRate: 450,
    rating: 4.85,
    reviewCount: 41,
    responseRate: 97,
  },
  {
    fullName: "Kabir Sen",
    email: "kabir.s@modhuralap.dev",
    gender: "male",
    city: "Kolkata",
    bio: "Photographer and nature lover. I'll show you the most Instagrammable spots in Kolkata!",
    interests: ["Photography", "Nature", "Hiking", "Coffee", "Art Galleries"],
    languages: ["English", "Hindi"],
    hourlyRate: 550,
    rating: 4.75,
    reviewCount: 36,
    responseRate: 94,
  },
  {
    fullName: "Rahul Ghosh",
    email: "rahul.g@modhuralap.dev",
    gender: "male",
    city: "Kolkata",
    bio: "Engineer by day, poet by night. Let me take you on a journey through words and food.",
    interests: ["Poetry", "Food", "Technology", "Writing", "Museums"],
    languages: ["Bengali", "Hindi", "English"],
    hourlyRate: 400,
    rating: 4.65,
    reviewCount: 24,
    responseRate: 90,
  },
  {
    fullName: "Dev Mukherjee",
    email: "dev.m@modhuralap.dev",
    gender: "male",
    city: "Kolkata",
    bio: "Traveler, foodie, and your perfect partner for weekend explorations and meaningful chats.",
    interests: ["Travel", "Food", "Culture", "Music", "History"],
    languages: ["English", "Bengali", "Hindi"],
    hourlyRate: 500,
    rating: 4.7,
    reviewCount: 39,
    responseRate: 96,
  },

  // ─── Female Companions (8) ──────────────────────────────
  {
    fullName: "Aanya Sharma",
    email: "aanya.s@modhuralap.dev",
    gender: "female",
    city: "Kolkata",
    bio: "Art curator and coffee enthusiast. Let's discover Kolkata's hidden art galleries together!",
    interests: ["Art", "Coffee", "Museums", "Fashion", "Reading"],
    languages: ["Hindi", "English", "Bengali"],
    hourlyRate: 600,
    rating: 4.95,
    reviewCount: 62,
    responseRate: 99,
  },
  {
    fullName: "Priya Bose",
    email: "priya.b@modhuralap.dev",
    gender: "female",
    city: "Kolkata",
    bio: "Classical dancer and literature lover. I bring grace, warmth and wonderful conversation to every meeting.",
    interests: ["Dance", "Literature", "Yoga", "Tea Ceremonies", "Cultural Events"],
    languages: ["Bengali", "Hindi", "English"],
    hourlyRate: 550,
    rating: 4.9,
    reviewCount: 53,
    responseRate: 98,
  },
  {
    fullName: "Sneha Roy",
    email: "sneha.r@modhuralap.dev",
    gender: "female",
    city: "Kolkata",
    bio: "Foodie and travel blogger. I know the best street food spots and hidden restaurants in the city!",
    interests: ["Food", "Travel", "Blogging", "Photography", "Street Food"],
    languages: ["English", "Bengali"],
    hourlyRate: 500,
    rating: 4.8,
    reviewCount: 45,
    responseRate: 96,
  },
  {
    fullName: "Isha Mukherjee",
    email: "isha.m@modhuralap.dev",
    gender: "female",
    city: "Kolkata",
    bio: "Psychology student with a warm smile. I love deep conversations and making people feel truly heard.",
    interests: ["Psychology", "Books", "Conversations", "Movies", "Walks"],
    languages: ["Bengali", "Hindi", "English"],
    hourlyRate: 450,
    rating: 4.75,
    reviewCount: 37,
    responseRate: 95,
  },
  {
    fullName: "Riya Chatterjee",
    email: "riya.c@modhuralap.dev",
    gender: "female",
    city: "Kolkata",
    bio: "Singer and music teacher. Let's bond over melodies and meaningful exchanges.",
    interests: ["Music", "Singing", "Teaching", "Concerts", "Cooking"],
    languages: ["Bengali", "English", "Hindi"],
    hourlyRate: 400,
    rating: 4.85,
    reviewCount: 41,
    responseRate: 97,
  },
  {
    fullName: "Meera Sen",
    email: "meera.s@modhuralap.dev",
    gender: "female",
    city: "Kolkata",
    bio: "Fashion designer with a love for vintage aesthetics. Every outing with me is a style statement.",
    interests: ["Fashion", "Design", "Vintage", "Cafes", "Shopping"],
    languages: ["Hindi", "English"],
    hourlyRate: 700,
    rating: 4.92,
    reviewCount: 58,
    responseRate: 99,
  },
  {
    fullName: "Tania Das",
    email: "tania.d@modhuralap.dev",
    gender: "female",
    city: "Kolkata",
    bio: "Fitness coach and wellness advocate. Join me for morning walks, healthy brunches, or sunset yoga.",
    interests: ["Fitness", "Yoga", "Wellness", "Nutrition", "Nature"],
    languages: ["English", "Bengali", "Hindi"],
    hourlyRate: 500,
    rating: 4.7,
    reviewCount: 33,
    responseRate: 93,
  },
  {
    fullName: "Nandini Ghosh",
    email: "nandini.g@modhuralap.dev",
    gender: "female",
    city: "Kolkata",
    bio: "Film buff and writer. Let's discuss cinema, grab popcorn, and share stories that matter.",
    interests: ["Cinema", "Writing", "Film Festivals", "Coffee", "Stories"],
    languages: ["Bengali", "English"],
    hourlyRate: 450,
    rating: 4.8,
    reviewCount: 44,
    responseRate: 96,
  },

  // ─── Non-Binary / Queer Companions (8) ──────────────────
  {
    fullName: "Ari Chakraborty",
    email: "ari.c@modhuralap.dev",
    gender: "non-binary",
    city: "Kolkata",
    bio: "Non-binary activist and painter. I create safe spaces for authentic conversations and self-expression.",
    interests: ["Activism", "Painting", "LGBTQ+", "Poetry", "Safe Spaces"],
    languages: ["English", "Bengali", "Hindi"],
    hourlyRate: 500,
    rating: 4.9,
    reviewCount: 42,
    responseRate: 98,
  },
  {
    fullName: "Sage Banerjee",
    email: "sage.b@modhuralap.dev",
    gender: "non-binary",
    city: "Kolkata",
    bio: "Musician and community builder. Every connection is an opportunity to learn something beautiful.",
    interests: ["Music", "Community", "Cooking", "Board Games", "Art"],
    languages: ["Bengali", "English"],
    hourlyRate: 450,
    rating: 4.85,
    reviewCount: 35,
    responseRate: 96,
  },
  {
    fullName: "River Mitra",
    email: "river.m@modhuralap.dev",
    gender: "non-binary",
    city: "Kolkata",
    bio: "Yoga instructor and mindfulness advocate. Let's find peace together through movement and presence.",
    interests: ["Yoga", "Mindfulness", "Meditation", "Tea", "Nature"],
    languages: ["Hindi", "English", "Bengali"],
    hourlyRate: 550,
    rating: 4.88,
    reviewCount: 38,
    responseRate: 97,
  },
  {
    fullName: "Quinn Dey",
    email: "quinn.d@modhuralap.dev",
    gender: "non-binary",
    city: "Kolkata",
    bio: "Stand-up comedian and podcaster. I promise laughter, good vibes, and zero awkward silences.",
    interests: ["Comedy", "Podcasting", "Movies", "Food", "Conversations"],
    languages: ["English", "Bengali"],
    hourlyRate: 400,
    rating: 4.78,
    reviewCount: 30,
    responseRate: 94,
  },
  {
    fullName: "Indigo Sen",
    email: "indigo.s@modhuralap.dev",
    gender: "non-binary",
    city: "Kolkata",
    bio: "Graphic designer and gamer. Looking to share creative experiences and geeky adventures.",
    interests: ["Design", "Gaming", "Anime", "Cafes", "Technology"],
    languages: ["English", "Hindi"],
    hourlyRate: 350,
    rating: 4.72,
    reviewCount: 25,
    responseRate: 91,
  },
  {
    fullName: "Ash Ghosh",
    email: "ash.g@modhuralap.dev",
    gender: "non-binary",
    city: "Kolkata",
    bio: "Spoken word artist and book club organizer. Let's have conversations that challenge and inspire.",
    interests: ["Poetry", "Books", "Spoken Word", "Theater", "Philosophy"],
    languages: ["Bengali", "English", "Hindi"],
    hourlyRate: 450,
    rating: 4.82,
    reviewCount: 34,
    responseRate: 95,
  },
  {
    fullName: "Juno Roy",
    email: "juno.r@modhuralap.dev",
    gender: "non-binary",
    city: "Kolkata",
    bio: "Herbalist and nature guide. I'll take you on botanical walks and share the magic of plants.",
    interests: ["Nature", "Plants", "Herbalism", "Walking", "Wellness"],
    languages: ["Bengali", "English"],
    hourlyRate: 500,
    rating: 4.86,
    reviewCount: 29,
    responseRate: 96,
  },
  {
    fullName: "Sky Mukherjee",
    email: "sky.m@modhuralap.dev",
    gender: "non-binary",
    city: "Kolkata",
    bio: "Dancer and DJ. I bring energy, rhythm, and unforgettable moments to every interaction.",
    interests: ["Dance", "DJing", "Music", "Nightlife", "Festivals"],
    languages: ["Hindi", "English", "Bengali"],
    hourlyRate: 600,
    rating: 4.91,
    reviewCount: 48,
    responseRate: 98,
  },
];

async function main() {
  console.log("🌱 Seeding database...\n");

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  let created = 0;
  let skipped = 0;

  for (const c of companions) {
    // Skip if email already exists
    const existing = await prisma.user.findUnique({ where: { email: c.email } });
    if (existing) {
      console.log(`  ⏭  Skipped (exists): ${c.fullName}`);
      skipped++;
      continue;
    }

    // Create user + companion profile in a transaction
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: c.email,
          passwordHash,
          fullName: c.fullName,
          gender: c.gender,
          city: c.city,
          isVerified: true,
          authProvider: "local",
        },
      });

      await tx.companionProfile.create({
        data: {
          userId: user.id,
          bio: c.bio,
          interests: c.interests,
          languages: c.languages,
          hourlyRate: c.hourlyRate,
          rating: c.rating,
          reviewCount: c.reviewCount,
          responseRate: c.responseRate,
          isAvailable: true,
        },
      });
    });

    console.log(`  ✅ Created: ${c.fullName} (${c.gender})`);
    created++;
  }

  console.log(`\n🎉 Seed complete: ${created} created, ${skipped} skipped`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
