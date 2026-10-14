import { prisma } from "../lib/prisma.js";
import { AppError } from "./auth.service.js";
import { resolveAvatars } from "./cloudinary.service.js";
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
      bio: true,
      interests: true,
      languages: true,
      dateOfBirth: true,
      isVerified: true,
      isPhoneVerified: true,
      isEmailVerified: true,
      createdAt: true,
      lookingFor: true,
      preferredGender: true,
      preferredAgeMin: true,
      preferredAgeMax: true,
      preferredLocation: true,
      preferredLanguages: true,
      profilePhotos: {
        where: { status: "CONFIRMED" },
        orderBy: [
          { isProfilePhoto: "desc" },
          { sortOrder: "asc" },
          { createdAt: "desc" },
        ] as { isProfilePhoto?: "asc" | "desc"; sortOrder?: "asc" | "desc"; createdAt?: "asc" | "desc" }[],
        select: {
          id: true,
          storageKey: true,
          isProfilePhoto: true,
          sortOrder: true,
          width: true,
          height: true,
        },
      },
    },
  },
};

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

  // Prepare user update data (only update if provided)
  const userUpdateData: any = {};
  if (input.bio !== undefined) userUpdateData.bio = input.bio;
  if (input.interests !== undefined) userUpdateData.interests = input.interests;
  if (input.languages !== undefined) userUpdateData.languages = input.languages;

  // Update user's base fields if any are provided
  if (Object.keys(userUpdateData).length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: userUpdateData
    });
  }

  // Upsert companion fields
  const companion = await prisma.companionProfile.upsert({
    where: { userId },
    create: {
      userId,
      hourlyRate: input.hourlyRate ?? 0,
      isAvailable: input.isAvailable ?? true,
    },
    update: {
      hourlyRate: input.hourlyRate ?? 0,
      isAvailable: input.isAvailable ?? true,
    },
    select: companionSelect,
  });

  return resolveAvatars(companion);
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

  const { bio, interests, languages, ...companionData } = input;

  // Update user fields if any were provided
  if (bio !== undefined || interests !== undefined || languages !== undefined) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(bio !== undefined && { bio }),
        ...(interests !== undefined && { interests }),
        ...(languages !== undefined && { languages }),
      }
    });
  }

  // Update companion profile
  const companion = await prisma.companionProfile.update({
    where: { userId },
    data: companionData,
    select: companionSelect,
  });

  return resolveAvatars(companion);
}

// ─── List Companions (with gender/city filter + pagination) ─

export async function listCompanions(query: ListCompanionsQuery, excludeUserId?: string) {
  const { gender, city, page, limit, search } = query;
  const skip = (page - 1) * limit;

  // Build where clause — filter on the related User's gender/city
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    isAvailable: true,
    user: {},
    ...(excludeUserId && { userId: { not: excludeUserId } }),
  };

  if (gender) {
    where.user.gender = gender;
  }

  if (city) {
    where.user.city = { equals: city, mode: "insensitive" };
  }

  if (search) {
    where.OR = [
      { user: { bio: { contains: search, mode: "insensitive" } } },
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
    companions: resolveAvatars(companions),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Get Single Companion ─────────────────────────────────

export async function getCompanionById(idOrUserId: string) {
  // 1. Try finding companionProfile by ID
  let companion = await prisma.companionProfile.findUnique({
    where: { id: idOrUserId },
    select: companionSelect,
  });

  // 2. Try finding companionProfile by userId
  if (!companion) {
    companion = await prisma.companionProfile.findUnique({
      where: { userId: idOrUserId },
      select: companionSelect,
    });
  }

  if (companion) {
    return resolveAvatars({
      ...companion,
      isCompanion: true,
    });
  }

  // 3. Fallback: Lookup User directly (e.g., Explore Buddies / users who are not companions)
  const user = await prisma.user.findUnique({
    where: { id: idOrUserId },
    select: {
      ...companionSelect.user.select,
      companionProfile: {
        select: {
          id: true,
          hourlyRate: true,
          rating: true,
          reviewCount: true,
          responseRate: true,
          isAvailable: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(404, "Profile not found");
  }

  const cp = user.companionProfile;
  const isCompanion = !!cp && cp.isAvailable;

  const result = {
    id: cp?.id || user.id,
    userId: user.id,
    hourlyRate: cp?.hourlyRate || 0,
    rating: cp?.rating || 5.0,
    reviewCount: cp?.reviewCount || 0,
    responseRate: cp?.responseRate || 100,
    isAvailable: cp?.isAvailable || false,
    isCompanion,
    createdAt: cp?.createdAt || user.createdAt,
    updatedAt: cp?.updatedAt || user.createdAt,
    user: {
      ...user,
      companionProfile: undefined,
    },
  };

  return resolveAvatars(result);
}

// ─── Get Companion by userId ──────────────────────────────

export async function getCompanionByUserId(userId: string) {
  const companion = await prisma.companionProfile.findUnique({
    where: { userId },
    select: companionSelect,
  });

  return resolveAvatars(companion); // Can be null if user hasn't created a profile
}
