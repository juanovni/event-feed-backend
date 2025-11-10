import prisma from "../../prisma/client";
//import { AttendEventDtoType } from "../../dtos/event/event-attendance.dto";

export const attendEvent = async (userId: string, eventId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });

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

