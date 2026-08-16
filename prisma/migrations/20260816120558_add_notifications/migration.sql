-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('EXPENSE_SUBMITTED', 'EXPENSE_APPROVED', 'EXPENSE_REJECTED', 'EXPENSE_MODIFIED', 'EXPENSE_DELETED', 'REIMBURSEMENT_PENDING', 'EXPENSE_REIMBURSED', 'REIMBURSEMENT_REJECTED', 'EMPLOYEE_ACCOUNT_CREATED', 'EMPLOYEE_ACCOUNT_DELETED', 'EMPLOYEE_ACCOUNT_UPDATED', 'ROLE_UPGRADED', 'ROLE_DOWNGRADED', 'ROLE_CHANGED', 'ROLE_VERIFICATION_PENDING', 'ROLE_VERIFICATION_APPROVED', 'ROLE_VERIFICATION_REJECTED', 'EMPLOYEE_VERIFICATION_PENDING', 'EMPLOYEE_VERIFICATION_APPROVED', 'EMPLOYEE_VERIFICATION_REJECTED', 'ADMIN_ACTION', 'SYSTEM');

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" SERIAL NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "userId" INTEGER NOT NULL,
    "expenseId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "public"."Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "public"."Notification"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "public"."Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;
