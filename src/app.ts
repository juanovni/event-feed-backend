import express from "express";
import cors from "cors";
import "express-async-errors";

import userRoutes from "./routes/user/user.routes";
import eventRoutes from "./routes/event/event.routes";
import followRoutes from "./routes/follow/follow.routes";
import authRoutes from "./routes/auth/auth.routes";
/* import { errorHandler } from "./middlewares/errorHandler"; */

const app = express();

// ✅ Configurar CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Frontend local (Next.js)
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true, // Si usas cookies o headers personalizados
  })
);


app.use(express.json());

app.get("/", (_req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/follow", followRoutes);


/* import { Router } from "express";
import { authenticate } from "../middlewares/auth";
const router = Router();
router.get("/profile", authenticate, async (req, res) => {
  res.json({ message: "Ruta protegida", userId: (req as any).userId });
});
 */

/* app.use(errorHandler); */

export default app;
