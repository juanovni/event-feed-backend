/*
  Warnings:

  - The `type` column on the `EventImage` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `userId` to the `EventImage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('event', 'gallery');

-- AlterTable
ALTER TABLE "EventImage" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "ImageType" NOT NULL DEFAULT 'event';

-- AddForeignKey
ALTER TABLE "EventImage" ADD CONSTRAINT "EventImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
