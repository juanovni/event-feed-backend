import express from "express";
import "express-async-errors";
import userRoutes from "./routes/user/user.routes";
/* import userRoutes from "./routes/user.routes";
import { errorHandler } from "./middlewares/errorHandler"; */

const app = express();

app.use(express.json());

app.get("/", (_req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

app.use("/api/users", userRoutes);

/* app.use(errorHandler); */

export default app;
