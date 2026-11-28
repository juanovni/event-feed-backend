CREATE TABLE "OrganizerSettlementReview" (
  "id" TEXT NOT NULL, "eventId" TEXT NOT NULL, "currency" TEXT NOT NULL, "reviewerId" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL, "snapshotHash" TEXT NOT NULL, "snapshot" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrganizerSettlementReview_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OrganizerSettlementReview_amount_check" CHECK ("amountCents" >= 0)
);
CREATE INDEX "OrganizerSettlementReview_eventId_currency_createdAt_idx" ON "OrganizerSettlementReview"("eventId", "currency", "createdAt");
ALTER TABLE "OrganizerSettlementReview" ADD CONSTRAINT "OrganizerSettlementReview_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrganizerSettlementReview" ADD CONSTRAINT "OrganizerSettlementReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE TABLE "OrganizerSettlementPayment" (
  "id" TEXT NOT NULL, "eventId" TEXT NOT NULL, "currency" TEXT NOT NULL, "reviewId" TEXT NOT NULL,
  "recordedById" TEXT NOT NULL, "amountCents" INTEGER NOT NULL, "paidAt" TIMESTAMP(3) NOT NULL,
  "reference" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrganizerSettlementPayment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OrganizerSettlementPayment_amount_check" CHECK ("amountCents" > 0)
);
CREATE UNIQUE INDEX "OrganizerSettlementPayment_reviewId_key" ON "OrganizerSettlementPayment"("reviewId");
CREATE UNIQUE INDEX "OrganizerSettlementPayment_eventId_currency_key" ON "OrganizerSettlementPayment"("eventId", "currency");
ALTER TABLE "OrganizerSettlementPayment" ADD CONSTRAINT "OrganizerSettlementPayment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrganizerSettlementPayment" ADD CONSTRAINT "OrganizerSettlementPayment_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "OrganizerSettlementReview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrganizerSettlementPayment" ADD CONSTRAINT "OrganizerSettlementPayment_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
