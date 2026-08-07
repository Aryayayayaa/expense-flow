import { z } from "zod";

export const expenseSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title is too long"),

  amount: z
    .coerce
    .number()
    .positive("Amount must be greater than 0"),

  category: z
    .string()
    .min(1, "Category is required"),

  expenseDate: z.coerce.date().max(
    new Date(),
    "Expense date and time cannot be in the future."
  ),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;