import prisma from "../../prisma/client";

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
