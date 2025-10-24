/*
  Warnings:

  - You are about to drop the column `isLiked` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `likes` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "isLiked",
DROP COLUMN "likes";
