import { Prisma } from "@prisma/client";

export function formatCurrency(amount: number | Prisma.Decimal) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount));
}
