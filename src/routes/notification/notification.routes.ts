import { Router } from "express";
import { NotificationController } from "../../controllers/notification/notification.controller";

const router = Router();

router.post("/", NotificationController.create);
router.get("/user/:userId", NotificationController.getByUser);
router.patch("/:id/read", NotificationController.markAsRead);
router.delete("/:id", NotificationController.delete);

export default router;
