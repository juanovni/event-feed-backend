import http from "http";
import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import prisma from "./prisma/client";
import { initSocket } from "./socket/socket";

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await prisma.$connect();

    //Socket
    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start", err);
    process.exit(1);
  }
}

start();
