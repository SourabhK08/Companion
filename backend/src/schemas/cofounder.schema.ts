import { z } from "zod";

export const createCoFounderSchema = z.object({
  linkedinUrl: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .refine((url) => /^https?:\/\/([a-z]{2,3}\.)?(www\.)?linkedin\.com\/.+/i.test(url), {
      message: "Please enter a valid LinkedIn profile URL (e.g. https://www.linkedin.com/in/your-name)",
    }),
  workInterests: z.array(z.string().trim()).max(20).optional(),
  pitch: z.string().max(1000).optional(),
  lookingFor: z.string().max(1000).optional(),
  isActive: z.boolean().default(true),
});

export const updateCoFounderSchema = createCoFounderSchema.partial();

export const listCoFoundersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().optional(),
  workInterests: z.string().optional(), // Can be comma-separated
});

export type CreateCoFounderInput = z.infer<typeof createCoFounderSchema>;
export type UpdateCoFounderInput = z.infer<typeof updateCoFounderSchema>;
export type ListCoFoundersQuery = z.infer<typeof listCoFoundersQuerySchema>;
