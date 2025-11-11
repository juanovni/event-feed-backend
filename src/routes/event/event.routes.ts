import { Router } from "express";
import multer from "multer";
import { toggleInterestHandler } from "../../controllers/event-interest/eventInterest.controller";
import { createEvent, getAllEvent, getConfirmedFriends } from "../../controllers/event/event.controller";
import { createAttendance, listAttendances } from "../../controllers/event-attendance/eventAttendance.controller";

import { authenticate } from "../../middlewares/auth";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Rutas protegidas
router.get("/", authenticate, getAllEvent);
router.post("/", authenticate, upload.single("mediaFile"), createEvent);

router.post("/:eventId/toggle-interest", authenticate, toggleInterestHandler);

router.post("/:eventId/attend", authenticate, createAttendance);
router.get("/:eventId/attendees", listAttendances);

router.get("/:eventId/confirmed-friends", authenticate, getConfirmedFriends);

export default router;
