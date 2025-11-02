import { Request, Response } from "express";
import * as eventService from "../../services/event/event.service";
import { CreateEventDto } from "../../dtos/event/create-event.dto";
import { NotificationService } from "../../services/notification/notification.service";

export const getAllEvent = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const isFollowing = req.query.isFollowing as boolean | undefined;

  const events = await eventService.getEvents(String(userId), isFollowing);
  res.json(events);
};


export const createEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Usuario no autenticado" });

    const eventParsed = CreateEventDto.safeParse(req.body);
    console.log(eventParsed);

    if (!eventParsed.success) {
      console.log(eventParsed.error);
      return { ok: false }
    }

    const event = await eventService.createEvent(String(userId), eventParsed.data);

    await NotificationService.create({
      title: "Nuevo evento",
      message: `${event.title} fue creado recientemente`,
      userId: "36901bb8-d078-4356-9e8f-253cb4a8de49",
      type: "success",
    });

    res.status(201).json(event);
  } catch (error: any) {
    console.error("Error al crear el evento:", error);
    res.status(400).json({ message: "Error interno del servidor" });
  }
};