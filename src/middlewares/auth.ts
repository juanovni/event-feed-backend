import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_secret_key";

interface TokenPayload {
  id: number;
  iat: number;
  exp: number;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token no proporcionado" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as TokenPayload;
    (req as any).userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};
