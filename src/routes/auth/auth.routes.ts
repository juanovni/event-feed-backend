
import { Router } from "express";
import {
  login,
  logout,
  preRegister,
  refresh,
  register
} from "../../controllers/auth/auth.controller";

const router = Router();

router.post("/pre-register", preRegister);
router.post("/complete-register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);


export default router;
