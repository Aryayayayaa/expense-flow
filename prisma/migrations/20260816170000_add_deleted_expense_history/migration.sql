/*
  Add DeletedExpense history and reconcile reimbursementStatus
  with the current Prisma schema.

  The previous migration originally created reimbursementStatus
  as nullable without a default. The live database has since
  been brought to the current required/default state, so this
  migration makes that state explicit in migration history.
*/

-- Reconcile reimbursementStatus with the current Prisma schema.

UPDATE "public"."Expense"
SET "reimbursementStatus" = 'PENDING'
WHERE "reimbursementStatus" IS NULL;

ALTER TABLE "public"."Expense"
ALTER COLUMN "reimbursementStatus" SET DEFAULT 'PENDING';

ALTER TABLE "public"."Expense"
ALTER COLUMN "reimbursementStatus" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."DeletedExpense" (
    "id" SERIAL NOT NULL,
    "originalExpenseId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "category" TEXT NOT NULL,
    "expenseDate" TIMESTAMP(3),
    "ocrReceiptUrl" TEXT,
    "ocrReceiptPath" TEXT,
    "ocrRawText" TEXT,
    "billProofUrl" TEXT,
    "billProofPath" TEXT,
    "deletionReason" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedById" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "DeletedExpense_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."DeletedExpense"
ADD CONSTRAINT "DeletedExpense_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "public"."User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DeletedExpense"
ADD CONSTRAINT "DeletedExpense_deletedById_fkey"
FOREIGN KEY ("deletedById")
REFERENCES "public"."User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;
