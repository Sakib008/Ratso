-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "temporaryToken" VARCHAR(255),
ADD COLUMN     "temporaryTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "verificationTokenExpiry" TIMESTAMP(3);
