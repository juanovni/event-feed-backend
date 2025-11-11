import prisma from "../../prisma/client";

export const getUsers = async () => {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, createdAt: true },
  });
};

export const getUserSuggestionsService = async (userId: string) => {
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const followingIds = following.map(f => f.followingId);

  // Encuentra usuarios que no sigas (y que no seas tú mismo)
  const suggestions = await prisma.user.findMany({
    where: {
      id: { notIn: [...followingIds, userId] },
    },
    select: {
      id: true,
      name: true,
      username: true,
      avatar: true,
      role: true,
      followers: {
        where: { followerId: userId },
        select: { id: true },
      },
      following: {
        where: { followingId: userId },
        select: { id: true },
      },
    },
    take: 5, // límite de sugerencias
  });

  // Estructura del DTO
  return suggestions.map(user => ({
    id: user.id,
    name: user.name,
    username: user.username,
    rol: user.role,
    avatar: user.avatar,
    isFollowing: user.followers.length > 0,
    followsYou: user.following.length > 0,
  }));
};