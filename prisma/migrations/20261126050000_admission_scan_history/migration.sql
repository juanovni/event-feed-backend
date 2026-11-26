CREATE TABLE "AdmissionScan" (
  "id" TEXT NOT NULL, "eventId" TEXT NOT NULL, "actorId" TEXT NOT NULL, "passId" TEXT,
  "result" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdmissionScan_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AdmissionScan_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AdmissionScan_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "AdmissionScan_passId_fkey" FOREIGN KEY ("passId") REFERENCES "AdmissionPass"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "AdmissionScan_eventId_createdAt_idx" ON "AdmissionScan"("eventId", "createdAt");
