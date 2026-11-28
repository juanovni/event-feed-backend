import { Router } from "express";
import { randomBytes } from "crypto";
import { z } from "zod";
import prisma from "../../prisma/client";
import { authenticate } from "../../middlewares/auth";

const router = Router();
router.use(authenticate);
const manager = async (userId: string, eventId: string) => {
  const [user, event] = await Promise.all([prisma.user.findUnique({ where: { id: userId }, select: { role: true } }), prisma.event.findUnique({ where: { id: eventId }, select: { userId: true } })]);
  return !!event && (user?.role === "admin" || (user?.role === "publisher" && event.userId === userId));
};
const commissionSchema = z.object({ type: z.enum(["percent", "fixed"]), value: z.number().int().positive().max(10000000) }).refine(data => data.type !== "percent" || data.value <= 10000);
const selectAssignment = { id: true, status: true, code: true, commissionType: true, commissionValue: true, createdAt: true, acceptedAt: true, revokedAt: true, user: { select: { id: true, name: true, email: true } } } as const;

const reportSelect = { commissionCents: true, commissionType: true, commissionValue: true, eligibleSubtotalCents: true, promoter: { select: { userId: true, user: { select: { name: true, username: true } }, event: { select: { id: true, title: true } } } }, ticket: { select: { id: true, itemsInOrder: true, paidAt: true, user: { select: { name: true, username: true } }, settlement: { select: { currency: true } } } } } as const;

function summarize(rows: Array<{ commissionCents: number; commissionType: string; commissionValue: number; eligibleSubtotalCents: number; promoter: { userId: string; user: { name: string | null; username: string }; event: { id: string; title: string } }; ticket: { id: string; itemsInOrder: number; paidAt: Date | null; user: { name: string | null; username: string }; settlement: { currency: string } | null } }>) {
  const groups = new Map<string, { promoterId: string; promoterName: string; eventId: string; eventTitle: string; currency: string; tickets: number; salesCents: number; commissionCents: number; purchases: { id: string; buyerName: string; quantity: number; paidAt: Date | null; subtotalCents: number; commissionCents: number; commissionType: string; commissionValue: number }[] }>();
  for (const row of rows) {
    const currency = row.ticket.settlement?.currency;
    if (!currency) continue;
    const key = JSON.stringify([row.promoter.event.id, row.promoter.userId, currency]);
    const group = groups.get(key) ?? { promoterId: row.promoter.userId, promoterName: row.promoter.user.name || row.promoter.user.username, eventId: row.promoter.event.id, eventTitle: row.promoter.event.title, currency, tickets: 0, salesCents: 0, commissionCents: 0, purchases: [] };
    group.tickets += row.ticket.itemsInOrder;
    group.salesCents += row.eligibleSubtotalCents;
    group.commissionCents += row.commissionCents;
    group.purchases.push({ id: row.ticket.id, buyerName: row.ticket.user.name || row.ticket.user.username, quantity: row.ticket.itemsInOrder, paidAt: row.ticket.paidAt, subtotalCents: row.eligibleSubtotalCents, commissionCents: row.commissionCents, commissionType: row.commissionType, commissionValue: row.commissionValue });
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => b.tickets - a.tickets || a.promoterName.localeCompare(b.promoterName));
}

async function addPayments(groups: ReturnType<typeof summarize>, where: { eventId?: string; promoterId?: string }) {
  const payments = await prisma.promoterPayment.findMany({ where, orderBy: { paidAt: "desc" }, select: { id: true, eventId: true, promoterId: true, currency: true, amountCents: true, paidAt: true, reference: true } });
  return groups.map(group => {
    const matching = payments.filter(p => p.eventId === group.eventId && p.promoterId === group.promoterId && p.currency === group.currency);
    const paidCents = matching.reduce((sum, p) => sum + p.amountCents, 0);
    return { ...group, paidCents, balanceCents: group.commissionCents - paidCents, payments: matching };
  });
}

router.get("/reports/mine", async (req, res) => {
  const rows = await prisma.promoterAttribution.findMany({ where: { promoter: { userId: String(req.user!.id) }, ticket: { isPaid: true } }, select: reportSelect, orderBy: { ticket: { paidAt: "desc" } } });
  return res.json(await addPayments(summarize(rows), { promoterId: String(req.user!.id) }));
});
router.get("/events/:eventId/report", async (req, res) => {
  const eventId = String(req.params.eventId);
  if (!await manager(String(req.user!.id), eventId)) return res.status(403).json({ message: "No autorizado." });
  const rows = await prisma.promoterAttribution.findMany({ where: { promoter: { eventId }, ticket: { isPaid: true } }, select: reportSelect, orderBy: { ticket: { paidAt: "desc" } } });
  return res.json(await addPayments(summarize(rows), { eventId }));
});

router.post("/events/:eventId/payments", async (req, res) => {
  const eventId = String(req.params.eventId), actor = String(req.user!.id);
  if (!await manager(actor, eventId)) return res.status(403).json({ message: "No autorizado." });
  const parsed = z.object({ id: z.string().uuid(), promoterId: z.string().uuid(), currency: z.string().regex(/^[A-Z]{3}$/), amountCents: z.number().int().positive().max(2147483647), paidAt: z.string().datetime({ offset: true }), reference: z.string().trim().min(1).max(120) }).safeParse(req.body);
  if (!parsed.success || (parsed.success && new Date(parsed.data.paidAt).getTime() > Date.now())) return res.status(400).json({ message: "Revisa el importe, la fecha y la referencia del pago." });
  const data = parsed.data;
  const result = await prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${JSON.stringify([eventId, data.promoterId, data.currency])}))`;
    const existing = await tx.promoterPayment.findUnique({ where: { id: data.id } });
    if (existing) {
      const same = existing.eventId === eventId && existing.promoterId === data.promoterId && existing.currency === data.currency && existing.amountCents === data.amountCents && existing.paidAt.getTime() === new Date(data.paidAt).getTime() && existing.reference === data.reference && existing.recordedById === actor;
      return same ? { ok: true } : { ok: false, message: "Esta solicitud ya se utilizó con otros datos. Actualiza la página antes de registrar otro pago." };
    }
    const [generated, paid] = await Promise.all([
      tx.promoterAttribution.aggregate({ where: { promoter: { eventId, userId: data.promoterId }, ticket: { isPaid: true, settlement: { currency: data.currency } } }, _sum: { commissionCents: true } }),
      tx.promoterPayment.aggregate({ where: { eventId, promoterId: data.promoterId, currency: data.currency }, _sum: { amountCents: true } }),
    ]);
    if (data.amountCents > (generated._sum.commissionCents ?? 0) - (paid._sum.amountCents ?? 0)) return { ok: false, message: "El importe supera la comisión pendiente. Actualiza el reporte y vuelve a intentarlo." };
    await tx.promoterPayment.create({ data: { ...data, eventId, recordedById: actor, paidAt: new Date(data.paidAt) } });
    return { ok: true };
  });
  return result.ok ? res.json({ ok: true }) : res.status(409).json({ message: result.message });
});

router.get("/assignments", async (req, res) => {
  const items = await prisma.eventPromoter.findMany({ where: { userId: String(req.user!.id), status: { in: ["pending", "accepted"] } }, select: { id: true, status: true, code: true, commissionType: true, commissionValue: true, event: { select: { id: true, slug: true, title: true, eventDate: true, user: { select: { name: true, username: true } } } } }, orderBy: { createdAt: "desc" } });
  return res.json(items.map(item => ({ ...item, code: item.status === "accepted" && item.commissionType ? item.code : null })));
});
router.post("/validate", async (req, res) => {
  const parsed = z.object({ eventId: z.string().uuid(), code: z.string().trim().min(1).max(64) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Código de promotor inválido." });
  const item = await prisma.eventPromoter.findFirst({ where: { eventId: parsed.data.eventId, code: parsed.data.code, status: "accepted", commissionType: { not: null }, commissionValue: { not: null } }, select: { user: { select: { name: true, username: true } } } });
  if (!item) return res.status(404).json({ message: "El código no está disponible para este evento." });
  return res.json({ name: item.user.name?.trim() || item.user.username });
});
router.post("/assignments/:id/accept", async (req, res) => {
  const result = await prisma.eventPromoter.updateMany({ where: { id: String(req.params.id), userId: String(req.user!.id), status: "pending" }, data: { status: "accepted", acceptedAt: new Date() } });
  return result.count ? res.json({ ok: true }) : res.status(404).json({ message: "Invitación no encontrada." });
});
router.get("/events/:eventId", async (req, res) => {
  const eventId = String(req.params.eventId);
  if (!await manager(String(req.user!.id), eventId)) return res.status(403).json({ message: "No autorizado." });
  return res.json(await prisma.eventPromoter.findMany({ where: { eventId }, select: selectAssignment, orderBy: { createdAt: "desc" } }));
});
router.post("/events/:eventId", async (req, res) => {
  const eventId = String(req.params.eventId), actor = String(req.user!.id);
  if (!await manager(actor, eventId)) return res.status(403).json({ message: "No autorizado." });
  const parsed = z.object({ email: z.string().trim().email().max(254) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Ingresa un correo válido." });
  const user = await prisma.user.findFirst({ where: { email: { equals: parsed.data.email, mode: "insensitive" }, isVerified: true }, select: { id: true } });
  if (!user) return res.status(404).json({ message: "La persona debe tener una cuenta verificada." });
  if (user.id === actor) return res.status(400).json({ message: "No puedes invitarte a ti mismo." });
  try {
    const item = await prisma.eventPromoter.create({ data: { eventId, userId: user.id, code: randomBytes(9).toString("base64url") }, select: selectAssignment });
    return res.status(201).json(item);
  } catch (error: any) { if (error.code === "P2002") return res.status(409).json({ message: "Ya existe una invitación activa para este evento." }); throw error; }
});
router.put("/events/:eventId/:id/commission", async (req, res) => {
  const eventId = String(req.params.eventId);
  if (!await manager(String(req.user!.id), eventId)) return res.status(403).json({ message: "No autorizado." });
  const parsed = commissionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "La comisión debe ser un valor válido mayor a cero; el porcentaje no puede superar el 100 %." });
  const result = await prisma.eventPromoter.updateMany({ where: { id: String(req.params.id), eventId, status: { in: ["pending", "accepted"] } }, data: { commissionType: parsed.data.type, commissionValue: parsed.data.value } });
  return result.count ? res.json({ ok: true }) : res.status(404).json({ message: "Asignación no encontrada." });
});
router.delete("/events/:eventId/:id", async (req, res) => {
  const eventId = String(req.params.eventId);
  if (!await manager(String(req.user!.id), eventId)) return res.status(403).json({ message: "No autorizado." });
  const result = await prisma.eventPromoter.updateMany({ where: { id: String(req.params.id), eventId, status: { in: ["pending", "accepted"] } }, data: { status: "revoked", revokedAt: new Date() } });
  return result.count ? res.json({ ok: true }) : res.status(404).json({ message: "Asignación no encontrada." });
});
export default router;
