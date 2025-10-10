import { z } from "zod";

export const ReviewSchema = z.object({
  id: z.string().min(1),
  userName: z.string().min(1),
  rating: z.number().min(0).max(5),
  headline: z.string().min(1),
  comment: z.string().min(1),
  createdAt: z.coerce.date(),
});

export type Review = z.infer<typeof ReviewSchema>;
