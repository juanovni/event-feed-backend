ALTER TABLE "TicketItem" ADD COLUMN "eventTicketTypeId" TEXT;
CREATE TABLE "PaymentAttempt" (
  "id" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "providerId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PaymentAttempt_ticketId_key" ON "PaymentAttempt"("ticketId");
CREATE UNIQUE INDEX "PaymentAttempt_providerId_key" ON "PaymentAttempt"("providerId");
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
