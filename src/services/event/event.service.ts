import prisma from "../../prisma/client";
import { CreateEventInput } from "../../dtos/event/create-event.dto";

export const getEvents = async (authUserId: string, isFollowing?: boolean) => {
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
      EventImage: {
        select: {
          id: true,
          url: true,
        },
      },
      attendees: true,
      userStatus: true,
      createdAt: true,
      updatedAt: false
    },
    orderBy: { createdAt: "desc" },
  });

  /* const user = await prisma.user.findFirst({
    where: { id: authUserId },
  });
  if (!user) return []; */

  // Obtenemos todos los follows del usuario logueado
  const follows = await prisma.follow.findMany({
    where: {
      followerId: authUserId,
    },
    select: { followingId: true },
  });

  const followingIds = new Set(follows.map((f) => f.followingId));

  const interests = await prisma.eventInterest.findMany({
    where: { userId: authUserId },
    select: { eventId: true },
  });
  const interestedEventIds = new Set(interests.map((i) => i.eventId));

  // Contar interesados por evento usando groupBy (más eficiente que un bucle)
  const interestCounts = await prisma.eventInterest.groupBy({
    by: ["eventId"],
    _count: { eventId: true },
  });

  // Transformar a un Map para acceso rápido
  const interestMap = new Map(
    interestCounts.map((i) => [i.eventId, i._count.eventId])
  );

  // 4️⃣ Agregar campo `isFollowing`
  const eventsWithFollow = events.map((event) => ({
    ...event,
    mediaUrl: event.EventImage[0]?.url || event.mediaUrl,
    category: event.category?.name || null,
    isFollowing: followingIds.has(event.user.id),
    isInterested: interestedEventIds.has(event.id),
    interested: interestMap.get(event.id) || 0, // total interesados real
  }));

  // 5️⃣ Si se pasa `isFollowing = true`, filtrar solo esos eventos
  if (isFollowing) {
    return eventsWithFollow.filter((event) => event.isFollowing);
  }

  return events.map((event) => ({
    ...event,
    mediaUrl: event.EventImage[0]?.url || event.mediaUrl,
    category: event.category?.name || null,
    isFollowing: followingIds.has(event.user.id),
    isInterested: interestedEventIds.has(event.id),
    interested: interestMap.get(event.id) || 0, // total interesados real
  }));
};

export const createEvent = async (userId: string, data: CreateEventInput) => {
  const {
    title,
    description,
    mediaType,
    mediaUrl,
    cost,
    currency,
    gallery,
    location,
    eventDate,
    attendees,
    userStatus,
    categoryId
  } = data;

  const event = await prisma.event.create({
    data: {
      title,
      description,
      mediaType,
      mediaUrl,
      cost: +cost,
      currency,
      gallery,
      location,
      eventDate: new Date(eventDate),
      userId,
      attendees: +attendees,
      userStatus,
      categoryId
    },
  });

  return event;

};