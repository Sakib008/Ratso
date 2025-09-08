/*
  Warnings:

  - You are about to alter the column `rating` on the `Review` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to drop the column `submittedReviews` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `totalReviews` on the `Store` table. All the data in the column will be lost.
  - The `status` column on the `Store` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."StoreStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_storeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Review" ALTER COLUMN "rating" SET DATA TYPE SMALLINT;

-- AlterTable
ALTER TABLE "public"."Store" DROP COLUMN "submittedReviews",
DROP COLUMN "totalReviews",
DROP COLUMN "status",
ADD COLUMN     "status" "public"."StoreStatus" NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
