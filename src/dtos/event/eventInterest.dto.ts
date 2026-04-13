import { z } from "zod";

export const GetMyInterestedEventsQueryDto = z.object({
  compact: z.coerce.boolean().optional().default(true),
  skip: z.coerce.number().int().min(0).optional().default(0),
  take: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type GetMyInterestedEventsQueryInput = z.infer<typeof GetMyInterestedEventsQueryDto>;