import { prisma } from "../lib/prisma.js";
import { AppError } from "./auth.service.js";
import type {
  CreateCompanionInput,
  UpdateCompanionInput,
  ListCompanionsQuery,
} from "../schemas/companion.schema.js";

/**
 * Companion profile service — business logic for companion CRUD.
 *
 * Gender filtering works by joining CompanionProfile → User
 * and filtering on User.gender. This way:
 *   - /explore/male   → gender = "male"
 *   - /explore/female  → gender = "female"
 *   - /explore/queer   → gender = "non-binary"
 */

// ─── Shared select for serialization ──────────────────────

const companionSelect = {
  id: true,
  userId: true,
  bio: true,
  interests: true,
  languages: true,
  hourlyRate: true,
  rating: true,
  reviewCount: true,
  responseRate: true,
  isAvailable: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      fullName: true,
      email: true,
      gender: true,
      city: true,
      avatar: true,
      isVerified: true,
    },
  },
} as const;

// ─── Create / Update Profile ──────────────────────────────

export async function createOrUpdateCompanion(
  userId: string,
  input: CreateCompanionInput
) {
  // Check if user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, "User not found");
  }

  // Upsert: create if doesn't exist, update if it does
  const companion = await prisma.companionProfile.upsert({
    where: { userId },
    create: {
      userId,
      bio: input.bio,
      interests: input.interests,
      languages: input.languages,
      hourlyRate: input.hourlyRate ?? 0,
      isAvailable: input.isAvailable ?? true,
    },
    update: {
      bio: input.bio,
      interests: input.interests,
      languages: input.languages,
      hourlyRate: input.hourlyRate ?? 0,
      isAvailable: input.isAvailable ?? true,
    },
    select: companionSelect,
  });

  return companion;
}

// ─── Update Profile ───────────────────────────────────────

export async function updateCompanion(
  userId: string,
  input: UpdateCompanionInput
) {
  const existing = await prisma.companionProfile.findUnique({
    where: { userId },
  });

  if (!existing) {
    throw new AppError(404, "Companion profile not found. Create one first.");
  }

  const companion = await prisma.companionProfile.update({
    where: { userId },
    data: input,
    select: companionSelect,
  });

  return companion;
}

// ─── List Companions (with gender/city filter + pagination) ─

export async function listCompanions(query: ListCompanionsQuery) {
  const { gender, city, page, limit, search } = query;
  const skip = (page - 1) * limit;

  // Build where clause — filter on the related User's gender/city
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    isAvailable: true,
    user: {},
  };

  if (gender) {
    where.user.gender = gender;
  }

  if (city) {
    where.user.city = { equals: city, mode: "insensitive" };
  }

  if (search) {
    where.OR = [
      { bio: { contains: search, mode: "insensitive" } },
      { user: { fullName: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [companions, total] = await Promise.all([
    prisma.companionProfile.findMany({
      where,
      select: companionSelect,
      skip,
      take: limit,
      orderBy: { rating: "desc" },
    }),
    prisma.companionProfile.count({ where }),
  ]);

  return {
    companions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Get Single Companion ─────────────────────────────────

export async function getCompanionById(companionId: string) {
  const companion = await prisma.companionProfile.findUnique({
    where: { id: companionId },
    select: companionSelect,
  });

  if (!companion) {
    throw new AppError(404, "Companion not found");
  }

  return companion;
}

// ─── Get Companion by userId ──────────────────────────────

export async function getCompanionByUserId(userId: string) {
  const companion = await prisma.companionProfile.findUnique({
    where: { userId },
    select: companionSelect,
  });

  return companion; // Can be null if user hasn't created a profile
}
