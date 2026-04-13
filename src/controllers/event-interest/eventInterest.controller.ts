import { Request, Response } from "express";
import * as interestService from "../../services/event-interest/eventInterest.service";
import { GetMyInterestedEventsQueryDto } from "../../dtos/event/eventInterest.dto";

export const toggleInterestHandler = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.id; // ✅ lo tomamos del token

    const result = await interestService.toggleInterest(String(userId), eventId);

    return res.json({
      message: result.interested
        ? "Marcado como interesado"
        : "Interés eliminado",
      ...result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al cambiar el estado de interés" });
  }
};

export const getMyInterestedEventsHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const queryParsed = GetMyInterestedEventsQueryDto.safeParse(req.query);
    if (!queryParsed.success) {
      return res.status(400).json({
        message: "Parámetros inválidos",
        error: queryParsed.error,
      });
    }

    const result = await interestService.getMyInterestedEvents(String(userId), queryParsed.data);
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener tus eventos de interés" });
  }
};
