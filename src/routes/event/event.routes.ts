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

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

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
