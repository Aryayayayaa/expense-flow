-- AlterTable
ALTER TABLE "public"."Expense" ADD COLUMN     "ocrRawText" TEXT,
ADD COLUMN     "ocrReceiptPath" TEXT,
ADD COLUMN     "ocrReceiptUrl" TEXT;
