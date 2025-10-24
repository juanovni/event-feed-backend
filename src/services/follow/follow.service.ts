import prisma from "../../prisma/client";

export const toggleFollow = async (followerId: string, followingId: string) => {
  if (followerId === followingId) {
    throw new Error("No puedes seguirte a ti mismo");
  }

  // 1️⃣ Verificar si ya existe el follow
  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });

  // 2️⃣ Si existe, eliminar (unfollow)
  if (existing) {
    await prisma.follow.delete({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });

    return { isFollowing: false, message: "Dejaste de seguir a este usuario" };
  }

  // 3️⃣ Si no existe, crear (follow)
  await prisma.follow.create({
    data: { followerId, followingId },
  });

  return { isFollowing: true, message: "Ahora sigues a este usuario" };
};
