/*
  Warnings:

  - The values [promoter] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `isFollowing` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('admin', 'user', 'publisher');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'user';
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "isFollowing" SET NOT NULL,
ALTER COLUMN "isFollowing" SET DEFAULT false;
