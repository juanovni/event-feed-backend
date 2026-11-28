ALTER TABLE "Event" ADD COLUMN "settlementDelayDays" INTEGER,
  ADD COLUMN "settlementDelayUpdatedBy" TEXT,
  ADD COLUMN "settlementDelayUpdatedAt" TIMESTAMP(3),
  ADD CONSTRAINT "Event_settlementDelayDays_check" CHECK ("settlementDelayDays" IS NULL OR "settlementDelayDays" BETWEEN 0 AND 3650);
