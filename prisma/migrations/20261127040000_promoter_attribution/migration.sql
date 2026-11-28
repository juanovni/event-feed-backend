CREATE TABLE "PromoterAttribution" (
  "id" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "promoterId" TEXT NOT NULL,
  "commissionType" TEXT NOT NULL,
  "commissionValue" INTEGER NOT NULL,
  "eligibleSubtotalCents" INTEGER NOT NULL,
  "eligibleQuantity" INTEGER NOT NULL,
  "commissionCents" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PromoterAttribution_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PromoterAttribution_nonnegative_check" CHECK ("eligibleSubtotalCents" >= 0 AND "eligibleQuantity" >= 0 AND "commissionCents" >= 0)
);
CREATE UNIQUE INDEX "PromoterAttribution_ticketId_key" ON "PromoterAttribution"("ticketId");
CREATE INDEX "PromoterAttribution_promoterId_idx" ON "PromoterAttribution"("promoterId");
ALTER TABLE "PromoterAttribution" ADD CONSTRAINT "PromoterAttribution_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PromoterAttribution" ADD CONSTRAINT "PromoterAttribution_promoterId_fkey" FOREIGN KEY ("promoterId") REFERENCES "EventPromoter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
