import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import {
  getUserSuggestions,
  listUsersHandler,
  updateUser
} from "../../controllers/user/user.controller";


const router = Router();

router.get("/", listUsersHandler);
router.put("/user", authenticate, updateUser);
router.get("/suggestions", authenticate, getUserSuggestions);

export default router;
