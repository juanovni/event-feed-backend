import { Request, Response } from "express";
import * as userService from "../../services/user/user.service";
import * as updateUserService from "../../services/user/updateUser.service";
import { v2 as cloudinary } from 'cloudinary';
import prisma from "../../prisma/client";
cloudinary.config(process.env.CLOUDINARY_URL ?? '');

export const listUsersHandler = async (_req: Request, res: Response) => {
  const users = await userService.getUsers();

  res.json(users);
};

export const getUserByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const { password, refreshToken, ...safeUser } = user;

    return res.json(safeUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener el usuario" });
  }
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

    if (!userId) return res.status(401).json({ message: "Usuario no autenticado" });

    // 1. Subir archivo a Cloudinary (si existe)
    let uploadedUrl: string | null = null;

    if (req.file) {

      uploadedUrl = await new Promise<string | null>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "users" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result?.secure_url ?? null);
          }
        );

        uploadStream.end(req.file!.buffer);
      });
    }

    // 2. Actualizar usuario en la base de datos
    await updateUserService.updateUserService(String(userId), data);

    // 3. Guardar imagen en tabla User (si se subió una nueva)
    if (uploadedUrl) {
      await prisma.user.update({
        where: { id: String(userId) },
        data: {
          avatar: uploadedUrl,
        },
      });
    }

    // 4. Obtener usuario actualizado para la respuesta
    const user = await userService.getUserById(String(userId));

    return res.json({
      message: "Usuario actualizado correctamente",
      user,
    });

  } catch (error: any) {
    console.log("Error en updateUser:", error);
    return res.status(500).json({
      message: error.message || "Error interno",
    });
  }
};
