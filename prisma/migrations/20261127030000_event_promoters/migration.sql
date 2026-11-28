CREATE TABLE "EventPromoter" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "code" TEXT NOT NULL,
  "commissionType" TEXT,
  "commissionValue" INTEGER,
  "acceptedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EventPromoter_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "EventPromoter_status_check" CHECK ("status" IN ('pending', 'accepted', 'revoked')),
  CONSTRAINT "EventPromoter_commission_check" CHECK (("commissionType" IS NULL AND "commissionValue" IS NULL) OR ("commissionType" = 'percent' AND "commissionValue" BETWEEN 1 AND 10000) OR ("commissionType" = 'fixed' AND "commissionValue" BETWEEN 1 AND 10000000))
);
CREATE UNIQUE INDEX "EventPromoter_code_key" ON "EventPromoter"("code");
CREATE INDEX "EventPromoter_eventId_userId_idx" ON "EventPromoter"("eventId", "userId");
CREATE INDEX "EventPromoter_userId_status_idx" ON "EventPromoter"("userId", "status");
CREATE UNIQUE INDEX "EventPromoter_active_assignment_key" ON "EventPromoter"("eventId", "userId") WHERE "status" IN ('pending', 'accepted');
ALTER TABLE "EventPromoter" ADD CONSTRAINT "EventPromoter_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EventPromoter" ADD CONSTRAINT "EventPromoter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
