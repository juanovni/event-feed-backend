-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('image', 'video');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('attending', 'interested', 'none');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "likes" INTEGER NOT NULL,
    "isLiked" BOOLEAN NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "location" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "attendees" INTEGER NOT NULL,
    "interested" INTEGER NOT NULL,
    "userStatus" "UserStatus" NOT NULL DEFAULT 'none',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
