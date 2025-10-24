import { toggleInterestHandler } from "../../controllers/event-interest/eventInterest.controller";
import { listEventsHandler } from "../../controllers/event/event.controller";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth";


const router = Router();

router.get("/", listEventsHandler);
router.post("/:eventId/toggle-interest", authenticate, toggleInterestHandler);

export default router;
