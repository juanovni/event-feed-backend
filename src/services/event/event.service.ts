import prisma from "../../prisma/client";

export const getEvents = async () => {
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

  const user = await prisma.user.findFirst();

  if (!user) return false;

  // Obtenemos todos los follows del usuario logueado
  const follows = await prisma.follow.findMany({
    where: {
      followerId: user.id,
    },
    select: { followingId: true },
  });
  const followingIds = new Set(follows.map((f) => f.followingId));

  return events.map((event) => ({
    ...event,
    category: event.category?.name || null,
    isFollowing: followingIds.has(event.user.id),
  }));
};
