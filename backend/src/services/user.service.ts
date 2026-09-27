import { prisma } from "../lib/prisma.js";
import { AppError } from "./auth.service.js";
import type { UpdateMeInput } from "../schemas/user.schema.js";

const userSelect = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  gender: true,
  dateOfBirth: true,
  city: true,
  avatar: true,
  bio: true,
  interests: true,
  languages: true,
  isVerified: true,
  authProvider: true,
  createdAt: true,
  companionProfile: { select: { id: true } },
} as const;

export async function updateMe(userId: string, input: UpdateMeInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: input,
    select: userSelect,
  });

  return updatedUser;
}
