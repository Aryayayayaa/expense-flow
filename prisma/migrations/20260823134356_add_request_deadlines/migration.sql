-- AlterTable
ALTER TABLE "public"."EmployeeVerificationRequest" ADD COLUMN     "deadlineAt" TIMESTAMP(3),
ADD COLUMN     "reminderSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."NameChangeRequest" ADD COLUMN     "deadlineAt" TIMESTAMP(3),
ADD COLUMN     "reminderSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."RoleVerificationRequest" ADD COLUMN     "deadlineAt" TIMESTAMP(3),
ADD COLUMN     "reminderSentAt" TIMESTAMP(3);
