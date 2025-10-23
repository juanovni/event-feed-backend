import { Router } from "express";
import { handleFollow } from "../../controllers/follow/follow.controller";

const router = Router();

router.post("/:followingId", handleFollow);

export default router;
