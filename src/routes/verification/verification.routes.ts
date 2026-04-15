import { Router } from "express";
import {
  sendCodeController,
  verifyCodeController,
} from "../../controllers/verification/verification.controller";
import { authenticate, optionalAuth } from "../../middlewares/auth";

const router = Router();

// POST /api/verification/send
router.post("/send", optionalAuth, sendCodeController);

// POST /api/verification/verify
router.post("/verify", optionalAuth, verifyCodeController);

export default router;