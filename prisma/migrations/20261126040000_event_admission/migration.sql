CREATE TABLE "EventAccessAssignment" (
  "id" TEXT NOT NULL, "eventId" TEXT NOT NULL, "userId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "acceptedAt" TIMESTAMP(3), "revokedAt" TIMESTAMP(3),
  CONSTRAINT "EventAccessAssignment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "EventAccessAssignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "EventAccessAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "EventAccessAssignment_eventId_userId_key" ON "EventAccessAssignment"("eventId", "userId");
CREATE INDEX "EventAccessAssignment_userId_status_idx" ON "EventAccessAssignment"("userId", "status");
CREATE TABLE "AdmissionPass" (
  "id" TEXT NOT NULL, "token" TEXT NOT NULL, "eventId" TEXT NOT NULL, "userId" TEXT NOT NULL,
  "ticketItemId" TEXT, "unitIndex" INTEGER, "attendanceId" TEXT, "redeemedAt" TIMESTAMP(3),
  "redeemedBy" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdmissionPass_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AdmissionPass_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AdmissionPass_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AdmissionPass_ticketItemId_fkey" FOREIGN KEY ("ticketItemId") REFERENCES "TicketItem"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AdmissionPass_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "EventAttendance"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AdmissionPass_redeemedBy_fkey" FOREIGN KEY ("redeemedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "AdmissionPass_source_check" CHECK (("ticketItemId" IS NOT NULL AND "unitIndex" IS NOT NULL AND "unitIndex" >= 0 AND "attendanceId" IS NULL) OR ("ticketItemId" IS NULL AND "unitIndex" IS NULL AND "attendanceId" IS NOT NULL))
);
CREATE UNIQUE INDEX "AdmissionPass_token_key" ON "AdmissionPass"("token");
CREATE UNIQUE INDEX "AdmissionPass_attendanceId_key" ON "AdmissionPass"("attendanceId");
CREATE UNIQUE INDEX "AdmissionPass_ticketItemId_unitIndex_key" ON "AdmissionPass"("ticketItemId", "unitIndex");
CREATE INDEX "AdmissionPass_userId_eventId_idx" ON "AdmissionPass"("userId", "eventId");
