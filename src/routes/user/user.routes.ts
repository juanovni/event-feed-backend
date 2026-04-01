
import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../middlewares/auth";
import {
  getUserSuggestions,
  listUsersHandler,
  updateUser
} from "../../controllers/user/user.controller";


const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", listUsersHandler);
router.put("/me", authenticate, upload.single("avatar"), updateUser);
router.get("/suggestions", authenticate, getUserSuggestions);

export default router;
