/*
  Warnings:

  - You are about to drop the column `billProofPath` on the `DeletedExpense` table. All the data in the column will be lost.
  - You are about to drop the column `billProofUrl` on the `DeletedExpense` table. All the data in the column will be lost.
  - You are about to drop the column `billProofPath` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `billProofUrl` on the `Expense` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."DeletedExpense" DROP COLUMN "billProofPath",
DROP COLUMN "billProofUrl";

-- AlterTable
ALTER TABLE "public"."Expense" DROP COLUMN "billProofPath",
DROP COLUMN "billProofUrl";
