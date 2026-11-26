CREATE TABLE "SettlementConfig" (
  "id" TEXT NOT NULL,
  "commissionRate" DECIMAL(9,6) NOT NULL,
  "commissionTaxRate" DECIMAL(9,6) NOT NULL,
  "processingRate" DECIMAL(9,6) NOT NULL,
  "processingTaxRate" DECIMAL(9,6) NOT NULL,
  "updatedBy" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SettlementConfig_pkey" PRIMARY KEY ("id")
);
