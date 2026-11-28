CREATE TABLE "PromoterCommissionAdjustment" (
  "id" TEXT NOT NULL,
  "attributionId" TEXT NOT NULL,
  "recordedById" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "reference" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PromoterCommissionAdjustment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PromoterCommissionAdjustment_amount_check" CHECK ("amountCents" > 0),
  CONSTRAINT "PromoterCommissionAdjustment_type_check" CHECK ("type" IN ('refund', 'chargeback'))
);
CREATE INDEX "PromoterCommissionAdjustment_attributionId_idx" ON "PromoterCommissionAdjustment"("attributionId");
ALTER TABLE "PromoterCommissionAdjustment" ADD CONSTRAINT "PromoterCommissionAdjustment_attributionId_fkey" FOREIGN KEY ("attributionId") REFERENCES "PromoterAttribution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PromoterCommissionAdjustment" ADD CONSTRAINT "PromoterCommissionAdjustment_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
