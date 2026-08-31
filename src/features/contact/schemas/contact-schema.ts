import { z } from "zod";

export const contactRequestSchema = z.object({
  category: z.string().min(1, "Please select a category."),

  subject: z
    .string()
    .trim()
    .min(10, "Subject must be at least 10 characters.")
    .max(150, "Subject cannot exceed 150 characters."),

  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters.")
    .max(5000, "Message cannot exceed 5000 characters."),
});

export type ContactRequestInput = z.infer<typeof contactRequestSchema>;
