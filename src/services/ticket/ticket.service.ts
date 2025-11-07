// src/services/ticket.service.ts
import { CreateTicketDto } from "../../dtos/ticket/ticket.dto";
import prisma from "../../prisma/client";

export class TicketService {
  async createTicket(userId: string, data: CreateTicketDto) {
    const { items } = data;

    if (!items || items.length === 0) {
      throw new Error("Debe incluir al menos un item para crear un ticket.");
    }

    // info event info 
    const events = await prisma.event.findMany({
      where: {
        id: {
          in: items.map((e) => e.eventId),
        },
      },
    });

    // Calcular los montos // Encabezado
    const itemsInOrder = items.reduce((count, p) => count + p.quantity, 0);

    // Los totales de tax, subtotal, y total
    const { subTotal, tax, total } = items.reduce(
      (totals, item) => {
        const productQuantity = item.quantity;
        const event = events.find((event) => event.id === item.eventId);

        if (!event) throw new Error(`${item.eventId} no existe - 500`);

        const subTotal = event.cost * productQuantity;

        totals.subTotal += subTotal;
        totals.tax += subTotal * 0.15;
        totals.total += subTotal * 1.15;

        return totals;
      },
      { subTotal: 0, tax: 0, total: 0 }
    );

    // Crear ticket con sus items
    const ticket = await prisma.ticket.create({
      data: {
        userId,
        subTotal,
        tax,
        total,
        itemsInOrder,
        isPaid: false,
        TicketItem: {
          createMany: {
            data: items.map((item) => ({
              eventId: item.eventId,
              quantity: item.quantity,
              price:
                events.find((event) => event.id === item.eventId)
                  ?.cost ?? 0,
            })),
          }
        },
      },
      include: {
        TicketItem: true,
      },
    });

    return {
      ok: true,
      ticket: ticket,
    }

  }

  async getTicketsByUser(userId: string) {
    const tickets = await prisma.ticket.findMany({
      where: { userId },
      select: {
        id: true,
        subTotal: true,
        tax: true,
        total: true,
        isPaid: true,
        paidAt: true,
        createdAt: true,
        TicketItem: {
          select: {
            id: true,
            event: {
              select: {
                id: true,
                title: true,
                description: true,
                location: true,
                mediaUrl: true,
                currency: true,
                eventDate: true,
                EventImage: {
                  select: {
                    id: true,
                    url: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return tickets.map((ticket) => {
      const event = ticket.TicketItem[0]?.event;
      const mediaUrl = event?.EventImage?.[0]?.url || event?.mediaUrl || null;

      const eventTitle = event?.title?.replace(/\s+/g, "").toUpperCase() || "EVENTO";
      const ticketNumber = `TCK-${ticket.id.split("-")[0].toUpperCase()}-${eventTitle}-${new Date(ticket.createdAt).getFullYear()}`;

      return {
        id: ticket.id,
        ticketNumber,
        subTotal: ticket.subTotal,
        tax: ticket.tax,
        total: ticket.total,
        itemsInOrder: ticket.TicketItem.length,
        isPaid: ticket.isPaid,
        paidAt: ticket.paidAt,
        createdAt: ticket.createdAt,
        event: event
          ? {
            id: event.id,
            title: event.title,
            description: event.description,
            location: event.location,
            currency: event.currency,
            eventDate: event.eventDate,
            mediaUrl,
          }
          : null,
      };
    });

  }

  async getTicketById(userId: string, ticketId: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { userId, id: ticketId },
      select: {
        id: true,
        subTotal: true,
        tax: true,
        total: true,
        paidAt: true,
        createdAt: true,
        isPaid: true,
        TicketItem: {
          select: {
            event: {
              select: {
                id: true,
                title: true,
                description: true,
                location: true,
                currency: true,
                eventDate: true,
                mediaUrl: true,
                EventImage: {
                  select: { url: true },
                },
              },
            },
          },
        },
      },
    });

    if (!ticket) throw new Error("Ticket no encontrado");

    const event = ticket.TicketItem[0]?.event;
    const mediaUrl = event?.EventImage?.[0]?.url || event?.mediaUrl || null;
    const ticketNumber = `TCK-${ticket.id.split("-")[0].toUpperCase()}-${event?.title?.replace(/\s+/g, "").toUpperCase()}-${new Date(ticket.createdAt).getFullYear()}`;

    return {
      id: ticket.id,
      ticketNumber,
      subTotal: ticket.subTotal,
      tax: ticket.tax,
      total: ticket.total,
      itemsInOrder: ticket.TicketItem.length,
      isPaid: ticket.isPaid ?? false,
      paidAt: ticket.paidAt,
      createdAt: ticket.createdAt,
      event: event
        ? {
          id: event.id,
          title: event.title,
          description: event.description,
          location: event.location,
          currency: event.currency,
          eventDate: event.eventDate,
          mediaUrl,
        }
        : null,
    };
  }

  async markAsPaid(ticketId: string, transactionId: string) {
    return await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        transactionId,
      },
    });
  }
}
