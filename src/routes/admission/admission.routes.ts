import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import prisma from "../../prisma/client";
import { acceptAssignment, getAssignments, inviteStaff, listPasses, listStaff, redeemPass, revokeStaff, scanHistory } from "../../services/admission/admission.service";

const router = Router();
router.use(authenticate);

router.get("/managed-events", async (req, res) => {
  const id = String(req.user!.id);
  const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (user?.role !== "admin" && user?.role !== "publisher") return res.json([]);
  const events = await prisma.event.findMany({
    where: user.role === "admin" ? {} : { userId: id },
    select: { id: true, title: true, eventDate: true, user: { select: { name: true, username: true } } },
    orderBy: { eventDate: "desc" },
  });
  return res.json(events);
});
router.get("/redemption-status", async (req, res) => {
  const passes = await prisma.admissionPass.findMany({
    where: { userId: String(req.user!.id), redeemedAt: { not: null } },
    select: {
      ticketItem: { select: { ticketId: true } },
      attendance: { select: { eventId: true } },
    },
  });
  const counts: Record<string, number> = {};
  for (const pass of passes) {
    const key = pass.ticketItem?.ticketId ?? (pass.attendance ? `attendance-${pass.attendance.eventId}` : null);
    if (key) counts[key] = (counts[key] ?? 0) + 1;
  }
  return res.json(counts);
});
router.get("/assignments", async (req, res) => res.json(await getAssignments(String(req.user!.id))));
router.post("/assignments/:id/accept", async (req, res) => {
  try { await acceptAssignment(String(req.user!.id), String(req.params.id)); return res.json({ ok: true }); }
  catch { return res.status(400).json({ message: "No se pudo aceptar la invitación." }); }
});
router.get("/passes/:accessId", async (req, res) => {
  try { return res.json(await listPasses(String(req.user!.id), String(req.params.accessId))); }
  catch { return res.status(404).json({ message: "Acceso no encontrado." }); }
});
router.get("/events/:eventId/staff", async (req, res) => {
  try { return res.json(await listStaff(String(req.user!.id), String(req.params.eventId))); }
  catch { return res.status(403).json({ message: "No autorizado." }); }
});
router.post("/events/:eventId/staff", async (req, res) => {
  try { return res.status(201).json(await inviteStaff(String(req.user!.id), String(req.params.eventId), req.body.email)); }
  catch (error) { return res.status(400).json({ message: error instanceof Error ? error.message : "No se pudo crear la invitación." }); }
});
router.delete("/events/:eventId/staff/:id", async (req, res) => {
  try { await revokeStaff(String(req.user!.id), String(req.params.eventId), String(req.params.id)); return res.json({ ok: true }); }
  catch { return res.status(400).json({ message: "No se pudo revocar el acceso." }); }
});
router.get("/events/:eventId/history", async (req, res) => {
  try { return res.json(await scanHistory(String(req.user!.id), String(req.params.eventId))); }
  catch { return res.status(403).json({ message: "No autorizado." }); }
});
router.post("/events/:eventId/redeem", async (req, res) => {
  try { return res.json(await redeemPass(String(req.user!.id), String(req.params.eventId), req.body.token)); }
  catch { return res.status(403).json({ message: "No autorizado." }); }
});
export default router;
