import { Request, Response } from "express";
import { NotificationService } from "../../services/notification/notification.service";
import { createNotificationDto } from "../../dtos/notification/notification.dto";

export const NotificationController = {
  async create(req: Request, res: Response) {
    try {
      const parsed = createNotificationDto.parse(req.body);
      const notification = await NotificationService.create(parsed);
      res.status(201).json(notification);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async getByUser(req: Request, res: Response) {
    const userId = parseInt(req.params.userId);
    const notifications = await NotificationService.findByUser(userId);
    res.json(notifications);
  },

  async markAsRead(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const notification = await NotificationService.markAsRead(id);
    res.json(notification);
  },

  async delete(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    await NotificationService.delete(id);
    res.status(204).send();
  },
};
