import { Request, Response } from "express";
import * as categoryService from "../../services/category/category.service";

export const getAllCategories = async (_req: Request, res: Response) => {
  const categories = await categoryService.getCategories();

  res.json(categories);
};
