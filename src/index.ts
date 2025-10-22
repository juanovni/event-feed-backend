import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import prisma from "./prisma/client";

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await prisma.$connect();
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start", err);
    process.exit(1);
  }
}

start();
