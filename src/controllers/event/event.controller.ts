import { Request, Response } from "express";
import * as eventService from "../../services/event/event.service";
import { CreateEventDto } from "../../dtos/event/create-event.dto";
import { NotificationService } from "../../services/notification/notification.service";
import { v2 as cloudinary } from 'cloudinary';
import prisma from "../../prisma/client";
cloudinary.config(process.env.CLOUDINARY_URL ?? '');

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

    if (!eventParsed.success) {
      return res.status(400).json({ message: "Datos inválidos", error: eventParsed.error });
    }

    // 📸 Subir archivo a Cloudinary (si existe)
    let uploadedUrl: string | null = null;

    if (req.file) {
      uploadedUrl = await new Promise<string | null>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "events" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result?.secure_url ?? null);
          }
        );

        uploadStream.end(req.file!.buffer);
      });
    }


    const event = await eventService.createEvent(String(userId), eventParsed.data);

    // 🖼️ Guardar imagen en tabla EventImage
    if (uploadedUrl) {
      await prisma.eventImage.create({
        data: {
          url: uploadedUrl,
          eventId: event.id,
          type: 'event',
          status: 'approved'
        },
      });
    }

    await NotificationService.create({
      title: "Nuevo evento",
      message: `${event.title} fue creado recientemente`,
      userId: String(userId),
      type: "success",
    });

    res.status(201).json(event);
  } catch (error: any) {
    console.error("Error al crear el evento:", error);
    res.status(400).json({ message: "Error interno del servidor" });
  }
};

export const getConfirmedFriends = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Usuario no autenticado" });

    const { eventId } = req.params;

    const friends = await eventService.getConfirmedFriends(String(userId), eventId);

    return res.status(200).json(friends);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener amigos confirmados" });
  }
};

export const uploadEventImageController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Usuario no autenticado" });

    const { eventId } = req.params;

    // 1. Subir a Cloudinary
    let imageUrl: string | null = null;
    if (req.file) {
      imageUrl = await new Promise<string | null>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "gallery" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result?.secure_url ?? null);
          }
        );

        uploadStream.end(req.file!.buffer);
      });
    }

    // 2. Registrar imagen en DB
    if (imageUrl) {
      const image = await eventService.uploadEventImage(String(userId), eventId, imageUrl);
      return res.status(201).json(image);
    }

    return res.status(400).json({ message: "No puedes subir fotos" });


  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener amigos confirmados" });
  }
};
