import { Router } from "express";
import { handleFollow } from "../../controllers/follow/follow.controller";
import { authenticate } from "../../middlewares/auth";

const router = Router();

router.post("/:followingId", authenticate, handleFollow);

export default router;
