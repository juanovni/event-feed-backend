-- CreateEnum
CREATE TYPE "ImageStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "EventImage" ADD COLUMN     "status" "ImageStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'event';
