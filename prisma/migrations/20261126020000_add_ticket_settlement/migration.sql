CREATE TABLE "TicketSettlement" (
  "id" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "organizerId" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "currency" TEXT NOT NULL,
  "ticketSubtotalCents" INTEGER NOT NULL,
  "ticketTaxCents" INTEGER NOT NULL,
  "buyerTotalCents" INTEGER NOT NULL,
  "commissionRate" DECIMAL(9,6) NOT NULL,
  "commissionTaxRate" DECIMAL(9,6) NOT NULL,
  "processingRate" DECIMAL(9,6) NOT NULL,
  "processingTaxRate" DECIMAL(9,6) NOT NULL,
  "commissionCents" INTEGER NOT NULL,
  "commissionTaxCents" INTEGER NOT NULL,
  "estimatedProcessingCents" INTEGER NOT NULL,
  "actualProcessingCents" INTEGER,
  "actualProcessingRecordedAt" TIMESTAMP(3),
  "actualProcessingRecordedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TicketSettlement_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TicketSettlement_ticketId_key" ON "TicketSettlement"("ticketId");
CREATE INDEX "TicketSettlement_organizerId_eventId_idx" ON "TicketSettlement"("organizerId", "eventId");
ALTER TABLE "TicketSettlement" ADD CONSTRAINT "TicketSettlement_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
