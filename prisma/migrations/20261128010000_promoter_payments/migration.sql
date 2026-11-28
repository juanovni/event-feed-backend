CREATE TABLE "PromoterPayment" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "promoterId" TEXT NOT NULL,
  "recordedById" TEXT NOT NULL,
  "currency" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "paidAt" TIMESTAMP(3) NOT NULL,
  "reference" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PromoterPayment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PromoterPayment_amount_check" CHECK ("amountCents" > 0)
);
CREATE INDEX "PromoterPayment_eventId_promoterId_currency_idx" ON "PromoterPayment"("eventId", "promoterId", "currency");
ALTER TABLE "PromoterPayment" ADD CONSTRAINT "PromoterPayment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PromoterPayment" ADD CONSTRAINT "PromoterPayment_promoterId_fkey" FOREIGN KEY ("promoterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PromoterPayment" ADD CONSTRAINT "PromoterPayment_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
