import { Request, Response } from "express";
import * as interestService from "../../services/event-interest/eventInterest.service";

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
