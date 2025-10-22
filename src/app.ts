import express from "express";
import cors from "cors";
import "express-async-errors";

import userRoutes from "./routes/user/user.routes";
import eventRoutes from "./routes/event/event.routes";
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

app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);


/* app.use(errorHandler); */

export default app;
