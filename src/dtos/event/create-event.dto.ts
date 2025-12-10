import { z } from "zod";

export const MediaTypeEnum = z.enum(["image", "video"]);
export const UserStatusEnum = z.enum(["attending", "interested", "none"]); // Ajusta según tus valores reales

export const EventTicketTypeDto = z.object({
  name: z.string().min(1, "El nombre del ticket es obligatorio"),
  price: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(0),
  validUntil: z.coerce.date().nullable().optional()
});

export const CreateEventDto = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  mediaType: MediaTypeEnum,
  mediaUrl: z.string().url("Debe ser una URL válida"),
  cost: z.coerce
    .number()
    .min(0)
    .transform(val => Number(val.toFixed(2))),
  currency: z.string().default("USA"),
  gallery: z.array(z.string().url()).default([]),
  location: z.string().min(1, "La ubicación es obligatoria"),
  eventDate: z.coerce.date(), // convierte string -> Date automáticamente
  attendees: z.string(),
  userStatus: UserStatusEnum.default("none"),
  categoryId: z.string().uuid(),
  eventTicketTypes: z
    .array(EventTicketTypeDto)
  //.min(1, "Debe agregar al menos un tipo de ticket"),
});

export type CreateEventInput = z.infer<typeof CreateEventDto>;