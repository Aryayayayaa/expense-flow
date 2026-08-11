/*
  Warnings:

  - You are about to alter the column `amount` on the `Expense` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE "public"."Expense" ADD COLUMN     "billProofUrl" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);
