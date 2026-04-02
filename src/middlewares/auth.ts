import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_secret_key";

interface TokenPayload {
  id: number;
  iat: number;
  exp: number;
}

// 🔹 Extender el tipo Request de Express para incluir `user`
declare module "express-serve-static-core" {
  interface Request {
    user?: { id: number };
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Token no proporcionado" });

  const token = authHeader.split(" ")[1];
  //console.log(token)
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as TokenPayload;
    req.user = { id: decoded.id }; // ✅ guardamos el id en req.user
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
      // Token inválido, pero permitimos que continúe
      req.user = undefined;
    }
  }

  next();
};
