import prisma from "../../prisma/client";

export const getEvents = async () => {
  const events = await prisma.event.findMany({
    select: {
      id: true,
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
  });

  // "Aplanar" el objeto category
  return events.map((event) => ({
    ...event,
    category: event.category?.name || null,
  }));
};
