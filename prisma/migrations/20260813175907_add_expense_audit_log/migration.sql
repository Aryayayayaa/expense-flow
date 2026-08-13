-- CreateEnum
CREATE TYPE "public"."ExpenseAuditAction" AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'APPROVED', 'REJECTED', 'OCR_RECEIPT_ATTACHED', 'BILL_PROOF_ATTACHED');

-- CreateTable
CREATE TABLE "public"."ExpenseAuditLog" (
    "id" SERIAL NOT NULL,
    "action" "public"."ExpenseAuditAction" NOT NULL,
    "expenseId" INTEGER,
    "actorId" INTEGER,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpenseAuditLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ExpenseAuditLog" ADD CONSTRAINT "ExpenseAuditLog_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "public"."Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExpenseAuditLog" ADD CONSTRAINT "ExpenseAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
