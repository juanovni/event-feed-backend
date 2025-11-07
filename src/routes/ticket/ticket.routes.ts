import { Router } from "express";
import { TicketController } from "../../controllers/ticket/ticket.controller";
import { authenticate } from "../../middlewares/auth";

const router = Router();
const controller = new TicketController();

router.post("/", authenticate, controller.create);
router.get("/user/", authenticate, controller.getByUser);
router.get("/user/ticket/:ticketId/", authenticate, controller.getById);
router.patch("/:ticketId/pay", controller.markAsPaid);

export default router;
