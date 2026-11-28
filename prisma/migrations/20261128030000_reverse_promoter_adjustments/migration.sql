ALTER TABLE "PromoterCommissionAdjustment"
  ADD COLUMN "reversedAt" TIMESTAMP(3),
  ADD COLUMN "reversedById" TEXT,
  ADD COLUMN "reversalReason" TEXT,
  ADD CONSTRAINT "PromoterCommissionAdjustment_reversal_check" CHECK (
    ("reversedAt" IS NULL AND "reversedById" IS NULL AND "reversalReason" IS NULL)
    OR ("reversedAt" IS NOT NULL AND "reversedById" IS NOT NULL AND "reversalReason" IS NOT NULL AND length(trim("reversalReason")) > 0)
  );
ALTER TABLE "PromoterCommissionAdjustment" ADD CONSTRAINT "PromoterCommissionAdjustment_reversedById_fkey"
  FOREIGN KEY ("reversedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
