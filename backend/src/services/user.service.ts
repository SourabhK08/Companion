import { prisma } from "../lib/prisma.js";
import { AppError } from "./auth.service.js";
import { resolveAvatars } from "./cloudinary.service.js";
import { normalizePhone } from "../lib/phone.js";
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
  linkedinUrl: true,
  isVerified: true,
  isPhoneVerified: true,
  isEmailVerified: true,
  authProvider: true,
  createdAt: true,
  companionProfile: { select: { id: true } },
  coFounderProfile: { select: { id: true } },
} as const;

export async function updateMe(userId: string, input: UpdateMeInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const data: Record<string, unknown> = { ...input };

  // If the phone number changes, the old verification no longer applies.
  if (input.phone !== undefined) {
    const newPhone = input.phone ? normalizePhone(input.phone) : null;
    data.phone = newPhone;
    if (newPhone !== user.phone && user.isPhoneVerified) {
      data.isPhoneVerified = false;
      // isVerified is currently driven only by phone verification
      data.isVerified = false;
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
    select: userSelect,
  });

  return resolveAvatars(updatedUser);
}
