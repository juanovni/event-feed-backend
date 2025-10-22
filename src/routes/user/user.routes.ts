import { listUsersHandler } from "../../controllers/user/user.controller";
import { Router } from "express";


const router = Router();

router.get("/", listUsersHandler);

export default router;
