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
      user: {
        select: {
          id: true,
          phone: true,
        },
      },
    },
  });

  if (!event) throw new Error("Evento no encontrado");
  //if (event.cost > 0) throw new Error("Solo se pueden registrar eventos gratuitos");

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

    if (attendee?.phone) {
      await sendEventRegistrationTemplate({
        to: attendee.phone,
        attendeeName: `${attendee.name || "Usuario"} ${attendee.lastName || ""}`.trim(),
        eventTitle: event.title,
        eventDate: formatEventDate(event.eventDate),
        location: event.location,
      });
    }
  } catch (error) {
    console.error("Error enviando WhatsApp de registro:", error);
  }

  return { message: "Asistencia registrada", attending: true };
}

export const getAttendees = async (eventId: string) => {
  return prisma.eventAttendance.findMany({
    where: { eventId },
    include: {
      user: {
        select: { id: true, name: true, username: true, avatar: true },
      },
    },
  });
}

