/*
  Warnings:

  - You are about to drop the `_UserInterests` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Interest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."_UserInterests" DROP CONSTRAINT "_UserInterests_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_UserInterests" DROP CONSTRAINT "_UserInterests_B_fkey";

-- AlterTable
ALTER TABLE "Interest" ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."_UserInterests";

-- AddForeignKey
ALTER TABLE "Interest" ADD CONSTRAINT "Interest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
