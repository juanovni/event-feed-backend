import { Request, Response } from "express";
import * as userService from "../../services/user/user.service";

export const listUsersHandler = async (_req: Request, res: Response) => {
  const users = await userService.getUsers();
  res.json(users);
};

