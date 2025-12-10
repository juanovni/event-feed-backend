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
        },
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
        where: {
          type: 'event'
        },
        select: {
          id: true,
          url: true,
        },
      },
      eventTicketTypes: {
        select: {
          id: true,
          name: true,
          price: true,
          quantity: true,
          validUntil: true,
        }
      },
      //attendees: true,
      userStatus: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Seguimientos del usuario
  const follows = await prisma.follow.findMany({
    where: { followerId: authUserId },
    select: { followingId: true },
  });
  const followingIds = new Set(follows.map(f => f.followingId));

  // Intereses del usuario
  const interests = await prisma.eventInterest.findMany({
    where: { userId: authUserId },
    select: { eventId: true },
  });
  const interestedEventIds = new Set(interests.map(i => i.eventId));

  // Conteo de interesados
  const interestCounts = await prisma.eventInterest.groupBy({
    by: ["eventId"],
    _count: { eventId: true },
  });
  const interestMap = new Map(
    interestCounts.map(i => [i.eventId, i._count.eventId])
  );

  // Eventos pagados
  const paidTickets = await prisma.ticketItem.findMany({
    where: {
      ticket: {
        userId: authUserId,
        isPaid: true,
      },
    },
    select: { eventId: true },
  });
  const paidEventIds = new Set(paidTickets.map(t => t.eventId));

  // Asistencias a eventos gratuitos
  const attendances = await prisma.eventAttendance.findMany({
    where: { userId: authUserId },
    select: { eventId: true },
  });
  const attendingEventIds = new Set(attendances.map(a => a.eventId));

  const attendancesCounts = await prisma.eventAttendance.groupBy({
    by: ["eventId"],
    _count: { eventId: true },
  });
  const attendMap = new Map(
    attendancesCounts.map(i => [i.eventId, i._count.eventId])
  );

  // Eventos
  const eventsWithUserData = events.map(event => ({
    ...event,
    mediaUrl: event.EventImage[0]?.url || event.mediaUrl,
    category: event.category?.name || null,
    isFollowing: followingIds.has(event.user.id),
    isInterested: interestedEventIds.has(event.id),
    interested: interestMap.get(event.id) || 0,
    //isAttending: event.cost === 0 && attendingEventIds.has(event.id),
    isAttending: attendingEventIds.has(event.id),
    attendees: attendMap.get(event.id) || 0,
    hasPaid: paidEventIds.has(event.id),
  }));

  // 🧭 Filtrado opcional
  if (isFollowing) {
    return eventsWithUserData.filter(event => event.isFollowing);
  }

  return eventsWithUserData;
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
    categoryId,
    eventTicketTypes = []
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
      categoryId,
      eventTicketTypes: {
        create: eventTicketTypes.map(t => ({
          name: t.name,
          price: +t.price,
          quantity: +t.quantity,
          validUntil: t.validUntil ? new Date(t.validUntil) : null,
        }))
      }
    },
    include: {
      eventTicketTypes: true
    }
  });

  return event;

};

export const getConfirmedFriends = async (userId: string, eventId: string) => {
  try {
    const confirmedFriends = await prisma.user.findMany({
      where: {
        // los que sigues
        followers: {
          some: {
            followerId: userId,
          },
        },
        // que asistieron al evento
        EventAttendance: {
          some: {
            eventId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
      },
    });

    return confirmedFriends;
  } catch (error) {
    console.error("Error en getConfirmedFriendsService:", error);
    throw new Error("Error al obtener amigos confirmados");
  }
};

export const uploadEventImage = async (
  userId: string,
  eventId: string,
  imageUrl: string
) => {
  // 1. Validar que el usuario exista y sea publisher
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  console.log(user);
  if (!user) throw new Error("Usuario no encontrado");
  /*  if (user.role !== "publisher") {
     throw new Error("Solo los Publishers pueden subir imágenes");
   } */

  // 2. Validar que el evento exista
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true },
  });

  if (!event) {
    throw new Error("El evento no existe");
  }

  // 3. Validar asistencia del usuario
  const attendance = await prisma.eventAttendance.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
  });

  // 4. Validar si ha pagado el evento
  const paidTicket = await prisma.ticketItem.findFirst({
    where: {
      eventId,
      ticket: {
        userId,
        isPaid: true,
      },
    },
  });

  if (!attendance && !paidTicket) {
    throw new Error(
      "No puedes subir fotos. Debes haber confirmado tu asistencia o haber pagado el evento."
    );
  }

  // 5. Crear imagen con estado pending
  const newImage = await prisma.eventImage.create({
    data: {
      url: imageUrl,
      status: "pending",
      type: "gallery",
      eventId,
      userId
    },
    select: {
      id: true,
      url: true,
      type: true,
      status: true,
      eventId: true,
    },
  });

  return newImage;
};

export const getEventImages = async (eventId: string) => {

  try {
    // Validar si el evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!event) {
      throw new Error("El evento no existe");
    }

    const images = await prisma.eventImage.findMany({
      where: {
        eventId,
        status: "approved", // solo imágenes aprobadas
        type: "gallery",
      },
      select: {
        id: true,
        url: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return images;
  } catch (error) {
    console.error("Error en getEventImagesService", error);
    throw new Error("No se pudieron obtener las imágenes del evento");
  }
};
