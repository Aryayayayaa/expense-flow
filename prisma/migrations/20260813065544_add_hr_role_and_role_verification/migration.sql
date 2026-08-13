-- CreateEnum
CREATE TYPE "public"."RoleRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "public"."Role" ADD VALUE 'HR';

-- CreateTable
CREATE TABLE "public"."RoleVerificationRequest" (
    "id" SERIAL NOT NULL,
    "requestedRole" "public"."Role" NOT NULL,
    "proofUrl" TEXT,
    "proofPath" TEXT,
    "status" "public"."RoleRequestStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "RoleVerificationRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."RoleVerificationRequest" ADD CONSTRAINT "RoleVerificationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoleVerificationRequest" ADD CONSTRAINT "RoleVerificationRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
