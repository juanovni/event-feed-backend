import express from "express";
import cors from "cors";
import "express-async-errors";

import userRoutes from "./routes/user/user.routes";
import eventRoutes from "./routes/event/event.routes";
import followRoutes from "./routes/follow/follow.routes";
import authRoutes from "./routes/auth/auth.routes";
import notificationRoutes from "./routes/notification/notification.routes";
import categoryRoutes from "./routes/category/category.routes";
import ticketRoutes from "./routes/ticket/ticket.routes";
import verificationRoutes from "./routes/verification/verification.routes";

/* import { errorHandler } from "./middlewares/errorHandler"; */

const app = express();

// ✅ Configurar CORS dinámicamente
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://event-feed-frontend.vercel.app",
  process.env.ALLOWED_ORIGINS,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);


app.use(express.json());

app.get("/", (_req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/verification", verificationRoutes);


/* import { Router } from "express";
import { authenticate } from "../middlewares/auth";
const router = Router();
router.get("/profile", authenticate, async (req, res) => {
  res.json({ message: "Ruta protegida", userId: (req as any).userId });
});
 */

/* app.use(errorHandler); */

export default app;
