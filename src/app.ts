import express from "express";
import "express-async-errors";
import userRoutes from "./routes/user/user.routes";
import eventRoutes from "./routes/event/event.routes";

/* import { errorHandler } from "./middlewares/errorHandler"; */

const app = express();

app.use(express.json());

app.get("/", (_req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);


/* app.use(errorHandler); */

export default app;
