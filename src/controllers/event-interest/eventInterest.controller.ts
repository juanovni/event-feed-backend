import { Request, Response } from "express";
import * as interestService from "../../services/event-interest/eventInterest.service";

export const toggleInterestHandler = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = "10a72ec0-e98d-4f1f-a2a8-55a4f140f591" // 👈 reemplaza por JWT real

    const result = await interestService.toggleInterest(userId, eventId);

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
