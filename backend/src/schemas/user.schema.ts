import { z } from "zod";

export const updateMeSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  city: z.string().optional().nullable(),
  avatar: z.string().url("Avatar must be a valid URL").optional().nullable(),
  bio: z.string().max(500, "Bio is too long").optional().nullable(),
  interests: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
