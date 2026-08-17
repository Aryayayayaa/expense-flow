/*
  Warnings:

  - The values [EMPLOYEE_ACCOUNT_DELETED] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."NotificationType_new" AS ENUM ('EXPENSE_SUBMITTED', 'EXPENSE_APPROVED', 'EXPENSE_REJECTED', 'EXPENSE_MODIFIED', 'EXPENSE_DELETED', 'REIMBURSEMENT_PENDING', 'EXPENSE_REIMBURSED', 'REIMBURSEMENT_REJECTED', 'EMPLOYEE_ACCOUNT_CREATED', 'EMPLOYEE_ACCOUNT_DEACTIVATED', 'EMPLOYEE_ACCOUNT_UPDATED', 'ROLE_UPGRADED', 'ROLE_DOWNGRADED', 'ROLE_CHANGED', 'ROLE_VERIFICATION_PENDING', 'ROLE_VERIFICATION_APPROVED', 'ROLE_VERIFICATION_REJECTED', 'EMPLOYEE_VERIFICATION_PENDING', 'EMPLOYEE_VERIFICATION_APPROVED', 'EMPLOYEE_VERIFICATION_REJECTED', 'ADMIN_ACTION', 'SYSTEM');
ALTER TABLE "public"."Notification" ALTER COLUMN "type" TYPE "public"."NotificationType_new" USING ("type"::text::"public"."NotificationType_new");
ALTER TYPE "public"."NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "public"."NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;
