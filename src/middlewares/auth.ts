import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_secret_key";

interface TokenPayload {
  id: string | number;
  iat: number;
  exp: number;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Token no proporcionado" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as TokenPayload;
    req.user = { id: decoded.id };
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, ACCESS_SECRET) as TokenPayload;
      req.user = { id: decoded.id };
    } catch {
      req.user = undefined;
    }
  }

  next();
};
