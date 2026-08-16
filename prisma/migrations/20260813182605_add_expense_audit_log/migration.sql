/*
  Warnings:

  - The values [OCR_RECEIPT_ATTACHED,BILL_PROOF_ATTACHED] on the enum `ExpenseAuditAction` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ExpenseAuditAction_new" AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'APPROVED', 'REJECTED');
ALTER TABLE "public"."ExpenseAuditLog" ALTER COLUMN "action" TYPE "public"."ExpenseAuditAction_new" USING ("action"::text::"public"."ExpenseAuditAction_new");
ALTER TYPE "public"."ExpenseAuditAction" RENAME TO "ExpenseAuditAction_old";
ALTER TYPE "public"."ExpenseAuditAction_new" RENAME TO "ExpenseAuditAction";
DROP TYPE "public"."ExpenseAuditAction_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."ExpenseAuditLog" DROP CONSTRAINT "ExpenseAuditLog_actorId_fkey";

-- AlterTable
ALTER TABLE "public"."ExpenseAuditLog" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "reason" TEXT;

-- AddForeignKey
ALTER TABLE "public"."ExpenseAuditLog" ADD CONSTRAINT "ExpenseAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
