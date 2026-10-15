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

// ─── List Companions (with full DB filtering + pagination) ─

export async function listCompanions(query: ListCompanionsQuery, excludeUserId?: string) {
  const {
    gender,
    city,
    page,
    limit,
    search,
    minPrice,
    maxPrice,
    age,
    minAge: queryMinAge,
    maxAge: queryMaxAge,
    interests,
    languages,
    sortBy,
  } = query;
  const skip = (page - 1) * limit;

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    isAvailable: true,
    user: {},
    ...(excludeUserId && { userId: { not: excludeUserId } }),
  };

  // 1. Gender Filter
  if (gender) {
    if (gender === "queer" || gender === "non-binary") {
      where.user.gender = { in: ["non-binary", "other", "queer", "transgender"], mode: "insensitive" };
    } else {
      where.user.gender = { equals: gender, mode: "insensitive" };
    }
  }

  // 2. City / Location Filter
  if (city && city.toLowerCase() !== "all" && city.toLowerCase() !== "any") {
    where.user.city = { equals: city.trim(), mode: "insensitive" };
  }

  // 3. Price / Hourly Rate Filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.hourlyRate = {};
    if (minPrice !== undefined) where.hourlyRate.gte = minPrice;
    if (maxPrice !== undefined) where.hourlyRate.lte = maxPrice;
  }

  // 4. Age / Date of Birth Filter
  let parsedMinAge = queryMinAge;
  let parsedMaxAge = queryMaxAge;

  if (age) {
    if (age.includes("+")) {
      const lower = parseInt(age.replace("+", "").trim(), 10);
      if (!isNaN(lower)) parsedMinAge = lower;
    } else if (age.includes("-") || age.includes("–")) {
      const parts = age.split(/[-–]/).map((p) => parseInt(p.trim(), 10));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        parsedMinAge = parts[0];
        parsedMaxAge = parts[1];
      }
    }
  }

  if (parsedMinAge !== undefined || parsedMaxAge !== undefined) {
    const now = new Date();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dobCondition: any = {};
    if (parsedMaxAge !== undefined) {
      const oldestDob = new Date(now.getFullYear() - parsedMaxAge - 1, now.getMonth(), now.getDate() + 1);
      dobCondition.gte = oldestDob;
    }
    if (parsedMinAge !== undefined) {
      const youngestDob = new Date(now.getFullYear() - parsedMinAge, now.getMonth(), now.getDate());
      dobCondition.lte = youngestDob;
    }

    const is25InRange =
      (parsedMinAge === undefined || 25 >= parsedMinAge) &&
      (parsedMaxAge === undefined || 25 <= parsedMaxAge);

    if (is25InRange) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { user: { dateOfBirth: dobCondition } },
            { user: { dateOfBirth: null } },
          ],
        },
      ];
    } else {
      where.user.dateOfBirth = dobCondition;
    }
  }

  // 5. Interests Filter
  if (interests) {
    const ignoredKeywords = new Set([
      "all",
      "all men",
      "all women",
      "all queer",
      "more",
    ]);

    const rawInterests = interests
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i.length > 0 && !ignoredKeywords.has(i.toLowerCase()));

    if (rawInterests.length > 0) {
      const expandedSet = new Set<string>();
      for (const item of rawInterests) {
        expandedSet.add(item);
        expandedSet.add(item.toLowerCase());
        expandedSet.add(item.charAt(0).toUpperCase() + item.slice(1));

        // Sub-word handling for compound interests like "Coffee & Cafés", "Food & Dining", etc.
        const subParts = item.split(/[&,/]/).map((s) => s.trim()).filter((s) => s.length > 1);
        for (const sub of subParts) {
          expandedSet.add(sub);
          expandedSet.add(sub.toLowerCase());
          expandedSet.add(sub.charAt(0).toUpperCase() + sub.slice(1));
        }
      }

      where.user.interests = {
        hasSome: Array.from(expandedSet),
      };
    }
  }

  // 6. Languages Filter
  if (languages) {
    const rawLanguages = languages
      .split(",")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (rawLanguages.length > 0) {
      const expandedLangs = new Set<string>();
      for (const lang of rawLanguages) {
        expandedLangs.add(lang);
        expandedLangs.add(lang.toLowerCase());
        expandedLangs.add(lang.charAt(0).toUpperCase() + lang.slice(1));
      }
      where.user.languages = {
        hasSome: Array.from(expandedLangs),
      };
    }
  }

  // 7. Search Filter (Debounced text search across Name, Bio, City)
  if (search && search.trim()) {
    const searchTerm = search.trim();
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { user: { fullName: { contains: searchTerm, mode: "insensitive" } } },
          { user: { bio: { contains: searchTerm, mode: "insensitive" } } },
          { user: { city: { contains: searchTerm, mode: "insensitive" } } },
        ],
      },
    ];
  }

  // 8. Sorting Logic
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = [{ rating: "desc" }, { reviewCount: "desc" }];
  if (sortBy === "newest") {
    orderBy = { createdAt: "desc" };
  } else if (sortBy === "top_rated") {
    orderBy = [{ rating: "desc" }, { reviewCount: "desc" }];
  } else if (sortBy === "price_low") {
    orderBy = { hourlyRate: "asc" };
  } else if (sortBy === "price_high") {
    orderBy = { hourlyRate: "desc" };
  } else if (sortBy === "recommended") {
    orderBy = [{ rating: "desc" }, { reviewCount: "desc" }];
  }

  const [companions, total] = await Promise.all([
    prisma.companionProfile.findMany({
      where,
      select: companionSelect,
      skip,
      take: limit,
      orderBy,
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
