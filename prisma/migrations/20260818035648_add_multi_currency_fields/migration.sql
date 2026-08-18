-- AlterTable
ALTER TABLE "public"."Expense" ADD COLUMN     "baseCurrencyAmount" DECIMAL(12,2),
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN     "exchangeRate" DECIMAL(18,8),
ADD COLUMN     "exchangeRateAt" TIMESTAMP(3);
