import { z } from "zod";

export const subscribeSchema = z.object({
  plan: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY"]),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;
