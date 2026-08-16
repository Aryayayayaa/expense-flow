/*
  Warnings:

  - The values [REIMBURSED] on the enum `ExpenseStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `reimbursedAt` on the `Expense` table, which still contains 3 non-null values.
  - You are about to drop the column `reimbursedById` on the `Expense` table, which still contains 3 non-null values.

*/

-- CreateEnum
CREATE TYPE "public"."ReimbursementStatus" AS ENUM ('PENDING', 'REIMBURSED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ExpenseStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "public"."Expense"
ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "public"."Expense"
ALTER COLUMN "status"
TYPE "public"."ExpenseStatus_new"
USING ("status"::text::"public"."ExpenseStatus_new");

ALTER TYPE "public"."ExpenseStatus"
RENAME TO "ExpenseStatus_old";

ALTER TYPE "public"."ExpenseStatus_new"
RENAME TO "ExpenseStatus";

DROP TYPE "public"."ExpenseStatus_old";

ALTER TABLE "public"."Expense"
ALTER COLUMN "status" SET DEFAULT 'PENDING';

COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Expense"
DROP CONSTRAINT "Expense_reimbursedById_fkey";

-- AlterTable
ALTER TABLE "public"."Expense"
DROP COLUMN "reimbursedAt",
DROP COLUMN "reimbursedById",
ADD COLUMN "reimbursementAt" TIMESTAMP(3),
ADD COLUMN "reimbursementById" INTEGER,
ADD COLUMN "reimbursementReason" TEXT,
ADD COLUMN "reimbursementStatus" "public"."ReimbursementStatus";

-- AddForeignKey
ALTER TABLE "public"."Expense"
ADD CONSTRAINT "Expense_reimbursementById_fkey"
FOREIGN KEY ("reimbursementById")
REFERENCES "public"."User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;