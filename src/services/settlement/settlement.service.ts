import prisma from "../../prisma/client";

function rate(name: string): number {
  const raw = process.env[name];
  const value = Number(raw);
  if (!raw || !Number.isFinite(value) || value < 0 || value > 1 || !/^\d+(\.\d{1,6})?$/.test(raw)) {
    throw new Error(`La tasa ${name} no está configurada correctamente.`);
  }
  return value;
}

export async function settlementRates() {
  const config = await prisma.settlementConfig.findUnique({ where: { id: "global" } });
  if (config) {
    return {
      commissionRate: Number(config.commissionRate),
      commissionTaxRate: Number(config.commissionTaxRate),
      processingRate: Number(config.processingRate),
      processingTaxRate: Number(config.processingTaxRate),
    };
  }
  return {
    commissionRate: rate("PLATFORM_COMMISSION_RATE"),
    commissionTaxRate: rate("PLATFORM_COMMISSION_TAX_RATE"),
    processingRate: rate("PAYPHONE_PROCESSING_RATE"),
    processingTaxRate: rate("PAYPHONE_PROCESSING_TAX_RATE"),
  };
}

export function calculateSettlement(subtotal: number, ticketTax: number, rates: Awaited<ReturnType<typeof settlementRates>>) {
  if (![subtotal, ticketTax].every(value => Number.isSafeInteger(value) && value >= 0)) {
    throw new Error("Importes inválidos.");
  }
  const buyerTotal = subtotal + ticketTax;
  const commissionCents = Math.round(subtotal * rates.commissionRate);
  const commissionTaxCents = Math.round(commissionCents * rates.commissionTaxRate);
  const processingBase = Math.round(buyerTotal * rates.processingRate);
  const estimatedProcessingCents = processingBase + Math.round(processingBase * rates.processingTaxRate);
  if (!Number.isSafeInteger(buyerTotal) || buyerTotal - commissionCents - commissionTaxCents - estimatedProcessingCents < 0) {
    throw new Error("Los costos exceden el valor de la compra.");
  }
  return { buyerTotal, commissionCents, commissionTaxCents, estimatedProcessingCents };
}

export async function listSettlements(organizerId: string) {
  const rows = await prisma.ticketSettlement.findMany({
    where: { organizerId, ticket: { isPaid: true } },
    include: { ticket: { select: { paidAt: true, itemsInOrder: true } } },
    orderBy: { createdAt: "desc" },
  });
  const events = await prisma.event.findMany({
    where: { id: { in: [...new Set(rows.map(row => row.eventId))] } },
    select: { id: true, title: true },
  });
  const eventTitles = new Map(events.map(event => [event.id, event.title]));
  return rows.map(row => ({
    id: row.id,
    ticketId: row.ticketId,
    eventId: row.eventId,
    eventTitle: eventTitles.get(row.eventId) ?? "Evento",
    ticketsSold: row.ticket.itemsInOrder,
    currency: row.currency,
    subtotalCents: row.ticketSubtotalCents,
    taxCents: row.ticketTaxCents,
    buyerTotalCents: row.buyerTotalCents,
    commissionCents: row.commissionCents,
    commissionTaxCents: row.commissionTaxCents,
    estimatedProcessingCents: row.estimatedProcessingCents,
    actualProcessingCents: row.actualProcessingCents,
    estimatedOrganizerCents: row.buyerTotalCents - row.commissionCents - row.commissionTaxCents - row.estimatedProcessingCents,
    reconciledOrganizerCents: row.actualProcessingCents === null ? null : row.buyerTotalCents - row.commissionCents - row.commissionTaxCents - row.actualProcessingCents,
    paidAt: row.ticket.paidAt,
  }));
}

export async function recordProcessingFee(actorId: string, settlementId: string, actualProcessingCents: number) {
  if (!Number.isSafeInteger(actualProcessingCents) || actualProcessingCents < 0) {
    throw new Error("El costo debe ser un número entero de centavos no negativo.");
  }
  return prisma.$transaction(async tx => {
    const row = await tx.ticketSettlement.findUnique({ where: { id: settlementId }, include: { ticket: true } });
    if (!row || !row.ticket.isPaid) throw new Error("Venta pagada no encontrada.");
    if (actualProcessingCents > row.buyerTotalCents - row.commissionCents - row.commissionTaxCents) {
      throw new Error("El costo excede el saldo disponible.");
    }
    return tx.ticketSettlement.update({
      where: { id: settlementId },
      data: { actualProcessingCents, actualProcessingRecordedAt: new Date(), actualProcessingRecordedBy: actorId },
      select: { id: true, actualProcessingCents: true, actualProcessingRecordedAt: true },
    });
  });
}
