import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { getUserSuggestions, listUsersHandler } from "../../controllers/user/user.controller";


const router = Router();

router.get("/", listUsersHandler);
router.get("/suggestions", authenticate, getUserSuggestions);

export default router;
