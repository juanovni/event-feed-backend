import prisma from "../../prisma/client";
import { GetMyInterestedEventsQueryInput } from "../../dtos/event/eventInterest.dto";

export const toggleInterest = async (userId: string, eventId: string) => {
  // Verificar si ya existe un interés
  const existing = await prisma.eventInterest.findUnique({
    where: {
      userId_eventId: { userId, eventId },
    },
  });

  if (existing) {
    // Eliminar interés si ya existe
    await prisma.eventInterest.delete({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    return { interested: false };
  } else {
    // Crear nuevo interés
    await prisma.eventInterest.create({
      data: { userId, eventId },
    });

    return { interested: true };
  }
};

export const getMyInterestedEvents = async (
  userId: string,
  query: GetMyInterestedEventsQueryInput
) => {
  const { compact, skip, take } = query;

  const interests = await prisma.eventInterest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip,
    take: take + 1,
    select: {
      eventId: true,
      createdAt: true,
      event: {
        select: {
          id: true,
          slug: true,
          title: true,
          location: true,
          eventDate: true,
          mediaUrl: true,
          EventImage: {
            where: {
              type: "event",
              status: "approved",
            },
            select: {
              url: true,
            },
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });

  const hasMore = interests.length > take;
  const sliced = hasMore ? interests.slice(0, take) : interests;

  const items = sliced.map((interest) => {
    const imageUrl = interest.event.EventImage[0]?.url || interest.event.mediaUrl;

    if (compact) {
      return {
        eventId: interest.eventId,
        imageUrl,
        interestedAt: interest.createdAt,
        eventTitle: interest.event.title,
        eventDate: interest.event.eventDate,
        eventSlug: interest.event.slug,
      };
    }

    return {
      eventId: interest.eventId,
      slug: interest.event.slug,
      title: interest.event.title,
      location: interest.event.location,
      eventDate: interest.event.eventDate,
      imageUrl,
      interestedAt: interest.createdAt,
    };
  });

  return {
    items,
    pagination: {
      skip,
      take,
      hasMore,
    },
  };
};
