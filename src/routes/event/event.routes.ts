import { Router } from "express";
import multer from "multer";
import { getMyInterestedEventsHandler, toggleInterestHandler } from "../../controllers/event-interest/eventInterest.controller";
import {
  createEvent,
  getAllEvent,
  getConfirmedFriends,
  getEventImagesController,
  uploadEventImageController,
  getEventBySlugController,
  getEventByIdController,
  getEventsByUserIdController
} from "../../controllers/event/event.controller";
import {
  createAttendance,
  listAttendances
} from "../../controllers/event-attendance/eventAttendance.controller";

import { authenticate, optionalAuth } from "../../middlewares/auth";
import prisma from "../../prisma/client";
import { Prisma } from "@prisma/client";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/me/saved", authenticate, async (req, res) => {
  const items = await prisma.savedEvent.findMany({ where: { userId: String(req.user!.id) }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], select: { eventId: true, createdAt: true, event: { select: { slug: true, title: true, eventDate: true, mediaUrl: true, EventImage: { where: { type: "event", status: "approved" }, select: { url: true }, orderBy: { createdAt: "desc" }, take: 1 } } } } });
  return res.json({ items: items.map(item => ({ eventId: item.eventId, eventSlug: item.event.slug, eventTitle: item.event.title, eventDate: item.event.eventDate, imageUrl: item.event.EventImage[0]?.url || item.event.mediaUrl, savedAt: item.createdAt })) });
});

router.put("/:eventId/saved", authenticate, async (req, res) => {
  const eventId = String(req.params.eventId);
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true } });
  if (!event) return res.status(404).json({ message: "Evento no encontrado." });
  await prisma.savedEvent.upsert({ where: { userId_eventId: { userId: String(req.user!.id), eventId } }, create: { userId: String(req.user!.id), eventId }, update: {} });
  return res.json({ saved: true });
});

router.delete("/:eventId/saved", authenticate, async (req, res) => {
  await prisma.savedEvent.deleteMany({ where: { userId: String(req.user!.id), eventId: String(req.params.eventId) } });
  return res.json({ saved: false });
});

router.get("/nearby", authenticate, async (req, res) => {
  try {
    const { south, north, west, east, query, category, price, from, until, cursor } = req.query;
    const coordinates = [south, north, west, east].map(Number);
    if ([south, north, west, east].some(v => typeof v !== "string" || v.trim() === "") || coordinates.some(v => !Number.isFinite(v))) return res.status(400).json({ message: "Área de búsqueda inválida." });
    const [s, n, w, e] = coordinates;
    if (s < -90 || n > 90 || s > n || w < -180 || w > 180 || e < -180 || e > 180) return res.status(400).json({ message: "Área de búsqueda inválida." });
    const start = typeof from === "string" ? new Date(from) : new Date();
    const end = typeof until === "string" ? new Date(until) : undefined;
    if (!Number.isFinite(start.getTime()) || (end && (!Number.isFinite(end.getTime()) || end <= start))) return res.status(400).json({ message: "Fechas inválidas." });
    const term = typeof query === "string" ? query.trim().slice(0, 100) : "";
    const clauses: Prisma.EventWhereInput[] = [{ lat: { gte: s, lte: n } }, w <= e ? { log: { gte: w, lte: e } } : { OR: [{ log: { gte: w, lte: 180 } }, { log: { gte: -180, lte: e } }] }, { NOT: { AND: [{ lat: 0 }, { log: 0 }] } }];
    if (term) clauses.push({ OR: [{ title: { contains: term, mode: "insensitive" } }, { location: { contains: term, mode: "insensitive" } }, { user: { name: { contains: term, mode: "insensitive" } } }, { user: { username: { contains: term, mode: "insensitive" } } }] });
    if (typeof category === "string" && category) clauses.push({ categoryId: category });
    if (price === "free") clauses.push({ OR: [{ eventTicketTypes: { some: { price: 0 } } }, { eventTicketTypes: { none: {} }, cost: 0 }] });
    if (price === "paid") clauses.push({ OR: [{ eventTicketTypes: { some: { price: { gt: 0 } } } }, { eventTicketTypes: { none: {} }, cost: { gt: 0 } }] });
    if (price && price !== "free" && price !== "paid") return res.status(400).json({ message: "Filtro de precio inválido." });
    const rows = await prisma.event.findMany({ where: { eventDate: { gte: start > new Date() ? start : new Date(), ...(end ? { lt: end } : {}) }, AND: clauses }, select: { id: true, slug: true, title: true, location: true, lat: true, log: true, eventDate: true, mediaType: true, mediaUrl: true, cost: true, currency: true, category: { select: { id: true, name: true } }, user: { select: { id: true, name: true, username: true, avatar: true } }, eventTicketTypes: { select: { id: true, name: true, price: true, quantity: true, validUntil: true } } }, orderBy: [{ eventDate: "asc" }, { id: "asc" }], take: 101, ...(typeof cursor === "string" && cursor ? { cursor: { id: cursor }, skip: 1 } : {}) });
    const more = rows.length > 100;
    const items = rows.slice(0, 100);
    return res.json({ items, nextCursor: more ? items[items.length - 1].id : null });
  } catch (error) {
    console.error("Error al buscar eventos cercanos", error);
    return res.status(500).json({ message: "No se pudieron consultar los eventos." });
  }
});

// Rutas públicas (sin requerir login)
router.get("/slug/:slug", optionalAuth, getEventBySlugController);
router.get("/id/:eventId", optionalAuth, getEventByIdController);
router.get("/user/:userId", optionalAuth, getEventsByUserIdController);

// Rutas protegidas
router.get("/", authenticate, getAllEvent);
router.get("/me/interests", authenticate, getMyInterestedEventsHandler);
router.post("/", authenticate, upload.single("mediaFile"), createEvent);

router.post("/:eventId/toggle-interest", authenticate, toggleInterestHandler);

router.post("/:eventId/attend", authenticate, createAttendance);
router.get("/:eventId/attendees", listAttendances);

router.get("/:eventId/confirmed-friends", authenticate, getConfirmedFriends);

router.post("/:eventId/upload-image", authenticate, upload.single("mediaFile"), uploadEventImageController);

router.get("/:eventId/images", optionalAuth, getEventImagesController);

export default router;
