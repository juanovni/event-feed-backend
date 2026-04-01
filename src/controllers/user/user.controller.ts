import { Request, Response } from "express";
import * as userService from "../../services/user/user.service";
import * as updateUserService from "../../services/user/updateUser.service";

export const listUsersHandler = async (_req: Request, res: Response) => {
  const users = await userService.getUsers();

  res.json(users);
};

export const getUserSuggestions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const suggestions = await userService.getUserSuggestionsService(String(userId));
    res.json(suggestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener sugerencias de usuarios" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const data = req.body;

    const user = await updateUserService.updateUserService(String(userId), data);

    return res.json({
      message: "Usuario actualizado correctamente",
      user,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Error interno",
    });
  }
};