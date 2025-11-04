import { Router } from "express";
import { TicketController } from "../../controllers/ticket/ticket.controller";
import { authenticate } from "../../middlewares/auth";

const router = Router();
const controller = new TicketController();

router.post("/", authenticate, controller.create.bind(controller));
router.get("/user/:userId", controller.getByUser.bind(controller));
router.patch("/:ticketId/pay", controller.markAsPaid.bind(controller));

export default router;
