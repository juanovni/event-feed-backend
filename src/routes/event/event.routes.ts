import { toggleInterestHandler } from "../../controllers/event-interest/eventInterest.controller";
import { listEventsHandler } from "../../controllers/event/event.controller";
import { Router } from "express";


const router = Router();

router.get("/", listEventsHandler);
router.post("/:eventId/toggle-interest", toggleInterestHandler);

export default router;
