-- CreateTable
CREATE TABLE "EventImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "EventImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventImage" ADD CONSTRAINT "EventImage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
