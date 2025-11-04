import { Router } from "express";
import { getAllCategories } from "../../controllers/category/category.controller";

const router = Router();

router.get("/", getAllCategories);


export default router;
