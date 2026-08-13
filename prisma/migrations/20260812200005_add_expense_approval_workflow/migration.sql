-- CreateEnum
CREATE TYPE "public"."ExpenseStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REIMBURSED');

-- AlterTable
ALTER TABLE "public"."Expense" ADD COLUMN     "decidedAt" TIMESTAMP(3),
ADD COLUMN     "decidedById" INTEGER,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "public"."ExpenseStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "public"."Expense" ADD CONSTRAINT "Expense_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
