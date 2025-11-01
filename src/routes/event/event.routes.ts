import { Router } from "express";
import { toggleInterestHandler } from "../../controllers/event-interest/eventInterest.controller";
import { createEvent, getAllEvent } from "../../controllers/event/event.controller";
import { authenticate } from "../../middlewares/auth";

const router = Router();

// Rutas protegidas
router.get("/", authenticate, getAllEvent);
router.post("/", authenticate, createEvent);

router.post("/:eventId/toggle-interest", authenticate, toggleInterestHandler);


export default router;
