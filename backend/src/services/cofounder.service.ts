import { prisma } from "../lib/prisma.js";
import { AppError } from "./auth.service.js";
import type {
  CreateCoFounderInput,
  UpdateCoFounderInput,
  ListCoFoundersQuery,
} from "../schemas/cofounder.schema.js";

const cofounderSelect = {
  id: true,
  userId: true,
  linkedinUrl: true,
  workInterests: true,
  pitch: true,
  lookingFor: true,
  isActive: true,
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
      linkedinUrl: true,
    },
  },
} as const;

export async function createOrUpdateProfile(userId: string, input: CreateCoFounderInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, "User not found");
  }

  // Update user's linkedinUrl if provided
  if (input.linkedinUrl) {
    await prisma.user.update({
      where: { id: userId },
      data: { linkedinUrl: input.linkedinUrl }
    });
  }

  const profile = await prisma.coFounderProfile.upsert({
    where: { userId },
    create: {
      userId,
      linkedinUrl: input.linkedinUrl,
      workInterests: input.workInterests ?? [],
      pitch: input.pitch,
      lookingFor: input.lookingFor,
      isActive: input.isActive ?? true,
    },
    update: {
      linkedinUrl: input.linkedinUrl,
      ...(input.workInterests !== undefined && { workInterests: input.workInterests }),
      ...(input.pitch !== undefined && { pitch: input.pitch }),
      ...(input.lookingFor !== undefined && { lookingFor: input.lookingFor }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
    select: cofounderSelect,
  });

  return profile;
}

export async function updateProfile(userId: string, input: UpdateCoFounderInput) {
  const existing = await prisma.coFounderProfile.findUnique({
    where: { userId },
  });

  if (!existing) {
    throw new AppError(404, "Co-Founder profile not found. Create one first.");
  }

  if (input.linkedinUrl) {
    await prisma.user.update({
      where: { id: userId },
      data: { linkedinUrl: input.linkedinUrl }
    });
  }

  const profile = await prisma.coFounderProfile.update({
    where: { userId },
    data: {
      ...(input.linkedinUrl !== undefined && { linkedinUrl: input.linkedinUrl }),
      ...(input.workInterests !== undefined && { workInterests: input.workInterests }),
      ...(input.pitch !== undefined && { pitch: input.pitch }),
      ...(input.lookingFor !== undefined && { lookingFor: input.lookingFor }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
    select: cofounderSelect,
  });

  return profile;
}

export async function listCoFounders(query: ListCoFoundersQuery, excludeUserId?: string) {
  const { page, limit, search, workInterests } = query;
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    isActive: true,
    ...(excludeUserId && { userId: { not: excludeUserId } }),
  };

  if (workInterests) {
    const interestsArray = workInterests.split(",").map(i => i.trim()).filter(Boolean);
    if (interestsArray.length > 0) {
      where.workInterests = { hasSome: interestsArray };
    }
  }

  if (search) {
    where.OR = [
      { user: { fullName: { contains: search, mode: "insensitive" } } },
      { pitch: { contains: search, mode: "insensitive" } },
      { lookingFor: { contains: search, mode: "insensitive" } }
    ];
  }

  const [profiles, total] = await Promise.all([
    prisma.coFounderProfile.findMany({
      where,
      select: cofounderSelect,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.coFounderProfile.count({ where }),
  ]);

  return {
    profiles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getById(id: string) {
  const profile = await prisma.coFounderProfile.findUnique({
    where: { id },
    select: cofounderSelect,
  });

  if (!profile) {
    throw new AppError(404, "Co-Founder profile not found");
  }

  return profile;
}

export async function getByUserId(userId: string) {
  const profile = await prisma.coFounderProfile.findUnique({
    where: { userId },
    select: cofounderSelect,
  });

  return profile;
}
