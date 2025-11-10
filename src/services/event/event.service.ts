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
        select: {
          id: true,
          url: true,
        },
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