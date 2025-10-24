import { Request, Response } from "express";
import * as eventService from "../../services/event/event.service";

export const listEventsHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  console.log(userId)

  const isFollowing = req.query.isFollowing as boolean | undefined;

  const events = await eventService.getEvents(String(userId), isFollowing);
  res.json(events);
};

