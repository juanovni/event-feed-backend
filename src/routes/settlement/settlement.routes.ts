import { Router } from "express";
import { z } from "zod";
import { createHash } from "crypto";
import { Prisma } from "@prisma/client";
import prisma from "../../prisma/client";
import { authenticate } from "../../middlewares/auth";
import { listSettlements, recordProcessingFee, settlementRates, settlementAvailability } from "../../services/settlement/settlement.service";

const router = Router();

const ratesSchema = z.object({
  commissionRate: z.number().min(0).max(1).multipleOf(0.000001),
  commissionTaxRate: z.number().min(0).max(1).multipleOf(0.000001),
  processingRate: z.number().min(0).max(1).multipleOf(0.000001),
  processingTaxRate: z.number().min(0).max(1).multipleOf(0.000001),
});

router.use("/admin", authenticate, async (req, res, next) => {
  const actor = await prisma.user.findUnique({ where: { id: String(req.user!.id) }, select: { role: true } });
  if (actor?.role !== "admin") return res.status(403).json({ message: "No autorizado." });
  next();
});

router.get("/admin/config", async (_req, res) => {
  try {
    return res.json(await settlementRates());
  } catch {
    return res.status(500).json({ message: "No se pudo leer la configuración." });
  }
});

router.put("/admin/config", async (req, res) => {
  const parsed = ratesSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Las tasas deben estar entre 0 y 1." });
  const data = { ...parsed.data, updatedBy: String(req.user!.id) };
  await prisma.settlementConfig.upsert({ where: { id: "global" }, create: { id: "global", ...data }, update: data });
  return res.json(parsed.data);
});

router.get("/admin/events", async (_req, res) => {
  const events = await prisma.event.findMany({ select: { id: true, title: true, eventDate: true, endDate: true, settlementDelayDays: true, user: { select: { name: true, username: true } } }, orderBy: { eventDate: "desc" } });
  return res.json(events.map(event => ({ ...event, availability: settlementAvailability(event.endDate, event.settlementDelayDays) })));
});

// Only for isolated development data: never enable this endpoint in production.
router.put("/admin/dev/events/:eventId/dates", async (req, res) => {
  if (process.env.NODE_ENV !== "development" || process.env.ENABLE_DEV_SETTLEMENT_TESTS !== "true") return res.status(404).json({ message: "No encontrado." });
  const parsed = z.object({ start: z.string().datetime({ offset: true }), end: z.string().datetime({ offset: true }) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Indica fechas válidas." });
  const start = new Date(parsed.data.start), end = new Date(parsed.data.end);
  if (end <= start) return res.status(400).json({ message: "La finalización debe ser posterior al inicio." });
  const eventId = String(req.params.eventId);
  const result = await prisma.event.updateMany({ where: { id: eventId }, data: { eventDate: start, endDate: end } });
  if (!result.count) return res.status(404).json({ message: "Evento no encontrado." });
  return res.json({ ok: true });
});

router.put("/admin/events/:eventId/delay", async (req, res) => {
  const parsed = z.object({ days: z.number().int().min(0).max(3650) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Ingresa una cantidad válida de días calendario." });
  const result = await prisma.event.updateMany({ where: { id: String(req.params.eventId) }, data: { settlementDelayDays: parsed.data.days, settlementDelayUpdatedBy: String(req.user!.id), settlementDelayUpdatedAt: new Date() } });
  if (!result.count) return res.status(404).json({ message: "Evento no encontrado." });
  return res.json({ ok: true });
});

async function settlementSnapshot(eventId: string, currency: string, db: Prisma.TransactionClient = prisma) {
  const rows = await db.ticketSettlement.findMany({ where: { eventId, currency, ticket: { isPaid: true } }, orderBy: { id: "asc" }, select: { id: true, ticketId: true, buyerTotalCents: true, commissionCents: true, commissionTaxCents: true, actualProcessingCents: true } });
  const amountCents = rows.reduce((sum, row) => sum + row.buyerTotalCents - row.commissionCents - row.commissionTaxCents - (row.actualProcessingCents ?? 0), 0);
  return { rows, amountCents, ready: rows.length > 0 && rows.every(row => row.actualProcessingCents !== null), hash: createHash("sha256").update(JSON.stringify(rows)).digest("hex") };
}

router.get("/admin/events/:eventId/settlements", async (req, res) => {
  const eventId = String(req.params.eventId);
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { endDate: true, settlementDelayDays: true } });
  if (!event) return res.status(404).json({ message: "Evento no encontrado." });
  const currencies = await prisma.ticketSettlement.findMany({ where: { eventId, ticket: { isPaid: true } }, distinct: ["currency"], select: { currency: true } });
  const data = await Promise.all(currencies.map(async ({ currency }) => {
    const [current, reviews, payment] = await Promise.all([
      settlementSnapshot(eventId, currency),
      prisma.organizerSettlementReview.findMany({ where: { eventId, currency }, orderBy: { createdAt: "desc" }, select: { id: true, amountCents: true, snapshotHash: true, createdAt: true, reviewer: { select: { name: true, username: true } } } }),
      prisma.organizerSettlementPayment.findUnique({ where: { eventId_currency: { eventId, currency } }, include: { review: { select: { snapshotHash: true } }, recordedBy: { select: { name: true, username: true } } } }),
    ]);
    const baseline = payment?.review.snapshotHash ?? reviews[0]?.snapshotHash;
    return { currency, currentAmountCents: current.ready ? current.amountCents : null, pendingFees: current.rows.filter(row => row.actualProcessingCents === null).length, availability: settlementAvailability(event.endDate, event.settlementDelayDays), reviews, payment, changed: !!baseline && baseline !== current.hash, differenceCents: current.ready && (payment || reviews[0]) ? current.amountCents - (payment?.amountCents ?? reviews[0].amountCents) : null };
  }));
  return res.json(data);
});

router.post("/admin/events/:eventId/settlements/:currency/review", async (req, res) => {
  const eventId = String(req.params.eventId), currency = String(req.params.currency);
  if (!/^[A-Z]{3}$/.test(currency)) return res.status(400).json({ message: "Moneda inválida." });
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { endDate: true, settlementDelayDays: true } });
  if (!event) return res.status(404).json({ message: "Evento no encontrado." });
  if (settlementAvailability(event.endDate, event.settlementDelayDays).status !== "available") return res.status(409).json({ message: "La liquidación aún no está disponible para revisión." });
  const result = await prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${JSON.stringify(["organizer-settlement", eventId, currency])}))`;
    if (await tx.organizerSettlementPayment.findUnique({ where: { eventId_currency: { eventId, currency } } })) return null;
    const current = await settlementSnapshot(eventId, currency, tx);
    if (!current.ready || current.amountCents < 0 || !Number.isSafeInteger(current.amountCents) || current.amountCents > 2147483647) return null;
    return tx.organizerSettlementReview.create({ data: { eventId, currency, reviewerId: String(req.user!.id), amountCents: current.amountCents, snapshotHash: current.hash, snapshot: current.rows } });
  });
  return result ? res.json({ id: result.id }) : res.status(409).json({ message: "La liquidación ya tiene un pago o existen costos pendientes de conciliar." });
});

router.post("/admin/events/:eventId/settlements/:currency/payment", async (req, res) => {
  const eventId = String(req.params.eventId), currency = String(req.params.currency), actor = String(req.user!.id);
  const parsed = z.object({ id: z.string().uuid(), reviewId: z.string().uuid(), paidAt: z.string().datetime({ offset: true }), reference: z.string().trim().min(1).max(120) }).safeParse(req.body);
  if (!parsed.success || new Date(parsed.success ? parsed.data.paidAt : "").getTime() > Date.now()) return res.status(400).json({ message: "Revisa la fecha y la referencia." });
  const data = parsed.data;
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { endDate: true, settlementDelayDays: true } });
  if (!event || settlementAvailability(event.endDate, event.settlementDelayDays).status !== "available") return res.status(409).json({ message: "La liquidación no está disponible para pago." });
  const result = await prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${JSON.stringify(["organizer-settlement", eventId, currency])}))`;
    const existing = await tx.organizerSettlementPayment.findUnique({ where: { eventId_currency: { eventId, currency } } });
    if (existing) return existing.id === data.id && existing.recordedById === actor && existing.reviewId === data.reviewId && existing.reference === data.reference && existing.paidAt.getTime() === new Date(data.paidAt).getTime() ? { ok: true } : { ok: false, message: "Ya existe un pago registrado para este evento y moneda." };
    const current = await settlementSnapshot(eventId, currency, tx);
    const review = await tx.organizerSettlementReview.findFirst({ where: { eventId, currency }, orderBy: { createdAt: "desc" } });
    if (!review || review.id !== data.reviewId || !current.ready || review.snapshotHash !== current.hash || review.amountCents <= 0) return { ok: false, message: "La revisión cambió o no tiene un importe pagable. Actualiza y revisa nuevamente." };
    await tx.organizerSettlementPayment.create({ data: { id: data.id, eventId, currency, reviewId: review.id, recordedById: actor, amountCents: review.amountCents, paidAt: new Date(data.paidAt), reference: data.reference } });
    return { ok: true };
  });
  return result.ok ? res.json({ ok: true }) : res.status(409).json({ message: result.message });
});

router.get("/admin/summary", async (_req, res) => {
  try {
    const [rows, legacyCount] = await Promise.all([
      prisma.ticketSettlement.findMany({
        where: { ticket: { isPaid: true } },
        include: { ticket: { select: { itemsInOrder: true } } },
      }),
      prisma.ticket.count({ where: { isPaid: true, settlement: null } }),
    ]);
    const organizers = await prisma.user.findMany({
      where: { id: { in: [...new Set(rows.map(row => row.organizerId))] } },
      select: { id: true, name: true, username: true },
    });
    const summary = new Map<string, {
      organizerId: string; organizerName: string; currency: string; ticketsSold: number;
      salesCents: number; commissionCents: number; estimatedPayoutCents: number;
      reconciledPayoutCents: number | null; pendingFees: number;
    }>();
    for (const row of rows) {
      const key = JSON.stringify([row.organizerId, row.currency]);
      let group = summary.get(key);
      if (!group) {
        const organizer = organizers.find(user => user.id === row.organizerId);
        group = {
          organizerId: row.organizerId,
          organizerName: organizer?.name || organizer?.username || row.organizerId,
          currency: row.currency,
          ticketsSold: 0, salesCents: 0, commissionCents: 0, estimatedPayoutCents: 0,
          reconciledPayoutCents: 0, pendingFees: 0,
        };
        summary.set(key, group);
      }
      const subtotal = row.buyerTotalCents - row.commissionCents - row.commissionTaxCents;
      group.ticketsSold += row.ticket.itemsInOrder;
      group.salesCents += row.buyerTotalCents;
      group.commissionCents += row.commissionCents;
      group.estimatedPayoutCents += subtotal - (row.actualProcessingCents ?? row.estimatedProcessingCents);
      if (row.actualProcessingCents === null) {
        group.pendingFees++;
        group.reconciledPayoutCents = null;
      } else if (group.reconciledPayoutCents !== null) {
        group.reconciledPayoutCents += subtotal - row.actualProcessingCents;
      }
    }
    return res.json({ organizers: [...summary.values()], legacyCount });
  } catch (error) {
    console.error("Error consultando resumen:", error);
    return res.status(500).json({ message: "No se pudo calcular el resumen." });
  }
});

router.get("/admin/sales", async (_req, res) => {
  const rows = await prisma.ticketSettlement.findMany({
    where: { ticket: { isPaid: true } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const events = await prisma.event.findMany({
    where: { id: { in: [...new Set(rows.map(row => row.eventId))] } },
    select: { id: true, title: true, user: { select: { name: true, username: true } } },
  });
  return res.json(rows.map(row => ({
    id: row.id, eventId: row.eventId,
    eventTitle: events.find(event => event.id === row.eventId)?.title ?? row.eventId,
    organizer: events.find(event => event.id === row.eventId)?.user?.username ?? row.organizerId,
    buyerTotalCents: row.buyerTotalCents,
    commissionCents: row.commissionCents,
    commissionTaxCents: row.commissionTaxCents,
    estimatedProcessingCents: row.estimatedProcessingCents,
    actualProcessingCents: row.actualProcessingCents,
    currency: row.currency,
  })));
});

router.get("/mine", authenticate, async (req, res) => {
  try {
    return res.json(await listSettlements(String(req.user!.id)));
  } catch (error) {
    console.error("Error consultando liquidaciones:", error);
    return res.status(500).json({ message: "No se pudieron consultar las liquidaciones." });
  }
});

router.get("/events/:eventId/status", authenticate, async (req, res) => {
  const eventId = String(req.params.eventId), actor = String(req.user!.id);
  const event = await prisma.event.findFirst({ where: { id: eventId, userId: actor }, select: { id: true } });
  if (!event) return res.status(403).json({ message: "No autorizado." });
  const [reviews, payments] = await Promise.all([
    prisma.organizerSettlementReview.findMany({ where: { eventId }, orderBy: { createdAt: "desc" }, select: { id: true, currency: true, amountCents: true, snapshotHash: true, createdAt: true } }),
    prisma.organizerSettlementPayment.findMany({ where: { eventId }, include: { review: { select: { snapshotHash: true } }, recordedBy: { select: { name: true, username: true } } } }),
  ]);
  const currencies = [...new Set([...reviews.map(item => item.currency), ...payments.map(item => item.currency)])];
  return res.json(await Promise.all(currencies.map(async currency => {
    const review = reviews.find(item => item.currency === currency), payment = payments.find(item => item.currency === currency);
    const current = await settlementSnapshot(eventId, currency);
    return { currency, review, payment, changed: !!(payment || review) && (payment?.review.snapshotHash ?? review?.snapshotHash) !== current.hash, differenceCents: current.ready && (payment || review) ? current.amountCents - (payment?.amountCents ?? review!.amountCents) : null };
  })));
});

router.patch("/:id/processing-fee", authenticate, async (req, res) => {
  try {
    const actorId = String(req.user!.id);
    const actor = await prisma.user.findUnique({ where: { id: actorId }, select: { role: true } });
    if (actor?.role !== "admin") return res.status(403).json({ message: "No autorizado." });
    const result = await recordProcessingFee(actorId, String(req.params.id), req.body.actualProcessingCents);
    return res.json(result);
  } catch (error) {
    console.error("Error conciliando costo:", error);
    return res.status(400).json({ message: "No se pudo registrar el costo." });
  }
});

export default router;
