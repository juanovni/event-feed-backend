import { Request, Response } from "express";
import { toggleFollow } from "../../services/follow/follow.service";

export const handleFollow = async (req: Request, res: Response) => {
  try {
    const followerId = "10a72ec0-e98d-4f1f-a2a8-55a4f140f591"; // Asumiendo que lo obtienes del token JWT o sesión
    const { followingId } = req.params;

    const result = await toggleFollow(followerId, followingId);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};
