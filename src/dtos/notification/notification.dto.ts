import { z } from "zod";

export const createNotificationDto = z.object({
  title: z.string().min(3),
  message: z.string().min(3),
  type: z.enum(["info", "warning", "error", "success"]).default("info"),
  userId: z.string(),
});

export type CreateNotificationDto = z.infer<typeof createNotificationDto>;
