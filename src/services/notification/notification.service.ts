import prisma from "../../prisma/client";
import { CreateNotificationDto } from "../../dtos/notification/notification.dto";

export const NotificationService = {
  async create(data: CreateNotificationDto) {
    return prisma.notification.create({ data });
  },

  async findByUser(userId: number) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async markAsRead(id: number) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  },

  async delete(id: number) {
    return prisma.notification.delete({ where: { id } });
  },
};
