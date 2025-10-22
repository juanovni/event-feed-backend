import { listEventsHandler } from "../../controllers/event/event.controller";
import { Router } from "express";


const router = Router();

router.get("/", listEventsHandler);

export default router;
