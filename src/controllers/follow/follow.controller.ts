import { Request, Response } from "express";
import { toggleFollow } from "../../services/follow/follow.service";

export const handleFollow = async (req: Request, res: Response) => {
  try {
    const followerId = "70628ed1-3d31-48a2-8f3e-cd2b83f1b871"; // Asumiendo que lo obtienes del token JWT o sesión
    const { followingId } = req.params;

    const result = await toggleFollow(followerId, followingId);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};
