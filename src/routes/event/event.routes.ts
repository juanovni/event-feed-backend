import { Router } from "express";
import multer from "multer";
import { toggleInterestHandler } from "../../controllers/event-interest/eventInterest.controller";
import { createEvent, getAllEvent } from "../../controllers/event/event.controller";
import { authenticate } from "../../middlewares/auth";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Rutas protegidas
router.get("/", authenticate, getAllEvent);
router.post("/", authenticate, upload.single("mediaFile"), createEvent);

router.post("/:eventId/toggle-interest", authenticate, toggleInterestHandler);


export default router;
