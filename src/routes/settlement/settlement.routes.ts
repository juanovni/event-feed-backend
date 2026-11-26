import { Router } from "express";
import { z } from "zod";
import prisma from "../../prisma/client";
import { authenticate } from "../../middlewares/auth";
import { listSettlements, recordProcessingFee, settlementRates } from "../../services/settlement/settlement.service";

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
