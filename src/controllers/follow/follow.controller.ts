import { Request, Response } from "express";
import { toggleFollow } from "../../services/follow/follow.service";

export const handleFollow = async (req: Request, res: Response) => {
  try {
    const followerId = req.user?.id;
    const { followingId } = req.params;

    const result = await toggleFollow(String(followerId), followingId);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};
