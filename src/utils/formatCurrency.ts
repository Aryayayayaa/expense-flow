import { Prisma } from "@prisma/client";

export function formatCurrency(
  amount: number | Prisma.Decimal,
  currency: string = "INR",
) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(Number(amount));
}
