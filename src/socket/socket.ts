import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

let io: Server | null = null;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    // puedes autenticar aquí por token enviado en query o header
    console.log("socket connected:", socket.id);

    socket.on("join_user", (userId: number) => {
      socket.join(`user_${userId}`); // sala por usuario
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected:", socket.id);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO no inicializado");
  return io;
}
