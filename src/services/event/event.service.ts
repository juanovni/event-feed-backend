import prisma from "../../prisma/client";

export const getEvents = async (isFollowing?: boolean) => {
  const events = await prisma.event.findMany({
    select: {
      id: true,
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        }
      },
      title: true,
      description: true,
      mediaType: true,
      mediaUrl: true,
      likes: true,
      isLiked: true,
      cost: true,
      currency: true,
      gallery: true,
      location: true,
      eventDate: true,
      category: {
        select: {
          id: false,
          name: true,
        },
      },
      attendees: true,
      interested: true,
      userStatus: true,
      createdAt: true,
      updatedAt: false
    },
    orderBy: { createdAt: "desc" },
  });

  const user = await prisma.user.findFirst({
    where: { username: "joseMurillo" },
  });

  if (!user) return [];

  // Obtenemos todos los follows del usuario logueado
  const follows = await prisma.follow.findMany({
    where: {
      followerId: user.id,
    },
    select: { followingId: true },
  });

  const followingIds = new Set(follows.map((f) => f.followingId));

  // 4️⃣ Agregar campo `isFollowing`
  const eventsWithFollow = events.map((event) => ({
    ...event,
    category: event.category?.name || null,
    isFollowing: followingIds.has(event.user.id),
  }));

  // 5️⃣ Si se pasa `isFollowing = true`, filtrar solo esos eventos
  if (isFollowing) {
    return eventsWithFollow.filter((event) => event.isFollowing);
  }

  return events.map((event) => ({
    ...event,
    category: event.category?.name || null,
    isFollowing: followingIds.has(event.user.id),
  }));
};
