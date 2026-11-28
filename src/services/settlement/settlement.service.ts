import prisma from "../../prisma/client";

export function settlementAvailability(endDate: Date | null, days: number | null, now = new Date()) {
  if (!endDate || days === null) return { availableAt: null, status: "unconfigured" as const };
  const availableAt = new Date(endDate);
  availableAt.setUTCDate(availableAt.getUTCDate() + days);
  return { availableAt, status: availableAt <= now ? "available" as const : "waiting" as const };
}

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
    select: { id: true, title: true, endDate: true, settlementDelayDays: true },
  });
  const eventDetails = new Map(events.map(event => [event.id, event]));
  const eventIds = events.map(event => event.id);
  const [attributions, payments] = await Promise.all([
    prisma.promoterAttribution.findMany({ where: { promoter: { eventId: { in: eventIds } }, ticket: { isPaid: true } }, select: { commissionCents: true, promoter: { select: { eventId: true, userId: true } }, ticket: { select: { settlement: { select: { currency: true } } } }, adjustments: { where: { reversedAt: null }, select: { amountCents: true } } } }),
    prisma.promoterPayment.findMany({ where: { eventId: { in: eventIds } }, select: { eventId: true, promoterId: true, currency: true, amountCents: true } }),
  ]);
  const balances = new Map<string, { eventId: string; currency: string; commission: number; paid: number }>();
  for (const item of attributions) {
    const currency = item.ticket.settlement?.currency;
    if (!currency) continue;
    const key = JSON.stringify([item.promoter.eventId, item.promoter.userId, currency]);
    const balance = balances.get(key) ?? { eventId: item.promoter.eventId, currency, commission: 0, paid: 0 };
    balance.commission += item.commissionCents - item.adjustments.reduce((sum, adjustment) => sum + adjustment.amountCents, 0);
    balances.set(key, balance);
  }
  for (const payment of payments) {
    const balance = balances.get(JSON.stringify([payment.eventId, payment.promoterId, payment.currency]));
    if (balance) balance.paid += payment.amountCents;
  }
  const promoterTotals = new Map<string, { commissionCents: number; paidCents: number; pendingCents: number; overpaidCents: number }>();
  for (const balance of balances.values()) {
    const key = JSON.stringify([balance.eventId, balance.currency]);
    const total = promoterTotals.get(key) ?? { commissionCents: 0, paidCents: 0, pendingCents: 0, overpaidCents: 0 };
    total.commissionCents += balance.commission;
    total.paidCents += balance.paid;
    total.pendingCents += Math.max(0, balance.commission - balance.paid);
    total.overpaidCents += Math.max(0, balance.paid - balance.commission);
    promoterTotals.set(key, total);
  }
  return rows.map(row => ({
    id: row.id,
    ticketId: row.ticketId,
    eventId: row.eventId,
    eventTitle: eventDetails.get(row.eventId)?.title ?? "Evento",
    availability: settlementAvailability(eventDetails.get(row.eventId)?.endDate ?? null, eventDetails.get(row.eventId)?.settlementDelayDays ?? null),
    promoters: promoterTotals.get(JSON.stringify([row.eventId, row.currency])) ?? { commissionCents: 0, paidCents: 0, pendingCents: 0, overpaidCents: 0 },
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
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${JSON.stringify(["organizer-settlement", row.eventId, row.currency])}))`;
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
