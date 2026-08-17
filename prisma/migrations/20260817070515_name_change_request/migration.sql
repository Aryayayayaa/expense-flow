/*
  Warnings:

  - Added the required column `reason` to the `NameChangeRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."NameChangeRequest_status_createdAt_idx";

-- DropIndex
DROP INDEX "public"."NameChangeRequest_userId_status_idx";

-- AlterTable
ALTER TABLE "public"."NameChangeRequest" ADD COLUMN     "proofPath" TEXT,
ADD COLUMN     "proofUrl" TEXT,
ADD COLUMN     "reason" TEXT NOT NULL;
