import { Request, Response } from "express";
import * as eventService from "../../services/event/event.service";

export const listEventsHandler = async (_req: Request, res: Response) => {
  const events = await eventService.getEvents();
  res.json(events);
};

