import prisma from "../../prisma/client";
import { CreateNotificationDto } from "../../dtos/notification/notification.dto";
import { getIO } from "../../socket/socket";

export const NotificationService = {
  async create(data: CreateNotificationDto) {
    const notification = await prisma.notification.create({ data });

    // Emitir evento en tiempo real a la sala del usuario
    try {
      const io = getIO();
      // Emite solo al usuario destino
      io.to(`user_${notification.userId}`).emit("notification:new", notification);
      // opcional: emitir contadores globales
      io.to(`user_${notification.userId}`).emit("notification:count", { userId: notification.userId });
    } catch (err) {
      console.warn("Socket emit falló:", (err as Error).message);
    }

    return notification;
  },

  async findByUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async markAsRead(id: string) {
    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    getIO().to(`user_${updated.userId}`).emit("notification:updated", updated);

    return updated;
  },

  async delete(id: string) {
    return prisma.notification.delete({ where: { id } });
  },
};
