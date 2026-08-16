-- AlterEnum
ALTER TYPE "public"."ExpenseAuditAction" ADD VALUE 'REIMBURSED';

-- AlterTable
ALTER TABLE "public"."Expense" ADD COLUMN     "reimbursedAt" TIMESTAMP(3),
ADD COLUMN     "reimbursedById" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Expense" ADD CONSTRAINT "Expense_reimbursedById_fkey" FOREIGN KEY ("reimbursedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
