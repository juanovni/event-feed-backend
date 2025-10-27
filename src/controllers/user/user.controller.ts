import { Request, Response } from "express";
import * as userService from "../../services/user/user.service";
import { NotificationService } from "../../services/notification/notification.service";

export const listUsersHandler = async (_req: Request, res: Response) => {
  const users = await userService.getUsers();

  await NotificationService.create({
    title: "Nuevo pedido",
    message: `Tu pedido #${users[0].id} fue recibido`,
    userId: "36901bb8-d078-4356-9e8f-253cb4a8de49",
    type: "success",
  });

  res.json(users);
};

