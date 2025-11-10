import { z } from "zod";

export const AttendEventDto = z.object({
  //userId: z.string().uuid(),
  eventId: z.string().uuid(),
});

export type AttendEventDtoType = z.infer<typeof AttendEventDto>;
