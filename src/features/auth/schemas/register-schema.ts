import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),

  email: z.email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});


export type RegisterFormData = z.infer<typeof registerSchema>;
