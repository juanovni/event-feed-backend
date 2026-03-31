import { Request, Response } from "express";
import prisma from "../../prisma/client";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../config/jwt";
import { registerService } from "../../services/user/registerUser.service";

export const register = async (req: Request, res: Response) => {
  try {
    const result = await registerService(req.body);

    res.status(201).json({
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Error al registrar usuario",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Credenciales incorrectas" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Credenciales incorrectas" });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        rol: user.role,
        email: user.email
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(401).json({ message: "Token de actualización no proporcionado" });

  try {
    const payload = verifyRefreshToken(refreshToken) as { id: number };
    const user = await prisma.user.findUnique({ where: { id: String(payload.id) } });

    if (!user || user.refreshToken !== refreshToken)
      return res.status(403).json({ message: "Refresh token inválido" });

    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: "Refresh token inválido o expirado" });
  }
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  try {
    const payload = verifyRefreshToken(refreshToken) as { id: number };

    await prisma.user.update({
      where: { id: String(payload.id) },
      data: { refreshToken: null },
    });

    res.json({ message: "Sesión cerrada correctamente" });
  } catch {
    res.status(400).json({ message: "Token inválido" });
  }
};
