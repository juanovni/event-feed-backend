import { Request, Response } from "express";
import * as eventService from "../../services/event/event.service";

export const listEventsHandler = async (_req: Request, res: Response) => {
  const isFollowing = _req.query.isFollowing as boolean | undefined;

  console.log(isFollowing)

  const events = await eventService.getEvents(isFollowing);
  res.json(events);
};

