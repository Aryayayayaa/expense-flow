/*
  Warnings:

  - The values [PENDING] on the enum `ContactRequestStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ContactRequestStatus_new" AS ENUM ('NEW', 'IN_PROGRESS', 'AWAITING_INFO', 'RESOLVED', 'CLOSED');
ALTER TABLE "public"."ContactRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."ContactRequest" ALTER COLUMN "status" TYPE "public"."ContactRequestStatus_new" USING ("status"::text::"public"."ContactRequestStatus_new");
ALTER TYPE "public"."ContactRequestStatus" RENAME TO "ContactRequestStatus_old";
ALTER TYPE "public"."ContactRequestStatus_new" RENAME TO "ContactRequestStatus";
DROP TYPE "public"."ContactRequestStatus_old";
ALTER TABLE "public"."ContactRequest" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- AlterTable
ALTER TABLE "public"."ContactRequest" ALTER COLUMN "status" SET DEFAULT 'NEW';
