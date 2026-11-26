import prisma from "../../prisma/client";
import { sendEventRegistrationTemplate } from "../notification/whatsapp.service";
//import { AttendEventDtoType } from "../../dtos/event/event-attendance.dto";

const formatEventDate = (eventDate: Date) => {
  return new Date(eventDate).toLocaleString("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export const attendEvent = async (userId: string, eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      eventDate: true,
      location: true,
      cost: true,
      eventTicketTypes: { select: { price: true } },
      user: {
        select: {
          id: true,
          phone: true,
        },
      },
    },
  });

  if (!event) throw new Error("Evento no encontrado");
  const requiresPayment = event.eventTicketTypes.length
    ? event.eventTicketTypes.every(type => type.price > 0)
    : event.cost > 0;
  if (requiresPayment) {
    const paidTicket = await prisma.ticket.findFirst({
      where: { userId, isPaid: true, TicketItem: { some: { eventId } } },
      select: { id: true },
    });
    if (!paidTicket) throw new Error("Se requiere una entrada pagada para confirmar la asistencia");
  }

  // Verificar si ya existe la asistencia
  const existing = await prisma.eventAttendance.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });

  if (existing) {
    return { message: "Ya estás registrado", attending: true };
  }

  // Registrar asistencia
  await prisma.eventAttendance.create({
    data: { userId, eventId },
  });

  await prisma.event.update({
    where: { id: eventId },
    data: { attendees: { increment: 1 } },
  });

  try {
    const attendee = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, lastName: true, phone: true },
    });

    /* if (attendee?.phone) {
      await sendEventRegistrationTemplate({
        to: attendee.phone,
        attendeeName: `${attendee.name || "Usuario"} ${attendee.lastName || ""}`.trim(),
        eventTitle: event.title,
        eventDate: formatEventDate(event.eventDate),
        location: event.location,
      });
    } */

  } catch (error) {
    console.error("Error enviando WhatsApp de registro:", error);
  }

  return { message: "Asistencia registrada", attending: true };
}

export const getAttendees = async (eventId: string) => {
  const attendees = await prisma.eventAttendance.findMany({
    where: { eventId },
    include: {
      user: {
        select: { id: true, name: true, username: true, lastName: true, avatar: true },
      },
    },
  });

  return attendees.map(({ user }) => ({
    id: user.id,
    user: user.name,
    username: user.username,
    lastName: user.lastName,
    avatar: user.avatar,
  }));
}

