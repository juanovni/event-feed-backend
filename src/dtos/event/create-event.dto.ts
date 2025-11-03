import { z } from "zod";

export const MediaTypeEnum = z.enum(["image", "video"]);
export const UserStatusEnum = z.enum(["attending", "interested", "none"]); // Ajusta según tus valores reales

export const CreateEventDto = z.object({
  //id: z.string().uuid().optional(), // Prisma genera UUID automáticamente
  title: z.string().min(1, "El título es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  mediaType: MediaTypeEnum,
  mediaUrl: z.string().url("Debe ser una URL válida"),
  //cost: z.number().nonnegative("El costo no puede ser negativo"),
  cost: z.coerce
    .number()
    .min(0)
    .transform(val => Number(val.toFixed(2))),
  currency: z.string().default("USA"),
  gallery: z.array(z.string().url()).default([]),
  location: z.string().min(1, "La ubicación es obligatoria"),
  eventDate: z.coerce.date(), // convierte string -> Date automáticamente
  //attendees: z.number().int().nonnegative(),
  attendees: z.string(),
  userStatus: UserStatusEnum.default("none"),
  //createdAt: z.date().optional(),
  //updatedAt: z.date().optional(),
  //userId: z.string().uuid(),
  categoryId: z.string().uuid(),
});

export type CreateEventInput = z.infer<typeof CreateEventDto>;