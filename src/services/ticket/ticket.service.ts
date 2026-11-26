// src/services/ticket.service.ts
import { CreateTicketDto } from "../../dtos/ticket/ticket.dto";
import prisma from "../../prisma/client";
/* import { sendEventRegistrationTemplate } from "../notification/whatsapp.service";

const formatEventDate = (eventDate: Date) => {
  return new Date(eventDate).toLocaleString("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}; */

export class TicketService {

  async createTicket(userId: string, data: CreateTicketDto) {
    const { items } = data;

    if (!Array.isArray(items) || !items.length ||
      items.some(item => !item || typeof item.eventTicketTypeId !== "string" ||
        typeof item.eventId !== "string" || !Number.isSafeInteger(item.quantity) || item.quantity <= 0)) {
      throw new Error("Debe incluir al menos un item para crear un ticket.");
    }

    // 1. Obtener todos los ticket types enviados
    const ticketTypes = await prisma.eventTicketType.findMany({
      where: {
        id: { in: items.map(i => i.eventTicketTypeId) }
      },
      include: { event: true },
    });

    if (ticketTypes.length !== items.length) {
      throw new Error("Uno o más tipos de ticket no existen.");
    }

    if (items.some(item => {
      const type = ticketTypes.find(t => t.id === item.eventTicketTypeId);
      return !type || type.eventId !== item.eventId ||
        (type.validUntil !== null && type.validUntil < new Date()) ||
        item.quantity > type.quantity || !Number.isFinite(type.price) || type.price < 0;
    })) {
      throw new Error("Una o más entradas no son válidas o no están disponibles.");
    }

    // 2. Calcular totales usando precios del backend
    let subTotal = 0;

    for (const item of items) {
      const type = ticketTypes.find(t => t.id === item.eventTicketTypeId);
      subTotal += Math.round((type?.price ?? 0) * 100) * item.quantity;
    }

    const taxRate = Number(process.env.TICKET_TAX_RATE);
    if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 1 || !process.env.TICKET_TAX_RATE) {
      throw new Error("El impuesto de entradas no está configurado.");
    }
    const taxInCents = Math.round(subTotal * taxRate);
    const total = (subTotal + taxInCents) / 100;
    const tax = taxInCents / 100;
    subTotal /= 100;

    const itemsInOrder = items.reduce((acc, i) => acc + i.quantity, 0);

    // 3. Crear el Ticket + TicketItems
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
            data: items.map(item => {
              const type = ticketTypes.find(t => t.id === item.eventTicketTypeId);

              return {
                eventId: item.eventId, // lo puedes tomar del frontend o del tipo
                quantity: item.quantity,
                price: type?.price || 0, // SIEMPRE usar el precio del backend
              };
            }),
          },
        },
      },
      include: {
        TicketItem: {
          include: { event: true }
        }
      }
    });

    return {
      ok: true,
      ticket,
    };
  }

  async getTicketsByUser(userId: string) {
    const tickets = await prisma.ticket.findMany({
      where: { userId, isPaid: true },
      include: {
        TicketItem: {
          include: {
            event: {
              include: { EventImage: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return tickets.map((t) => this.mapTicketToResponse(t));
  }

  async getTicketById(userId: string, ticketId: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId, userId, isPaid: true },
      include: {
        TicketItem: {
          include: {
            event: {
              include: { EventImage: true },
            },
          },
        },
      },
    });

    if (!ticket) throw new Error("Ticket no encontrado");
    return this.mapTicketToResponse(ticket);
  }

  async markAsPaid(ticketId: string, transactionId: string) {
    const paidTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { isPaid: true, paidAt: new Date(), transactionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        TicketItem: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                eventDate: true,
                location: true,
                user: {
                  select: {
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const eventsById = new Map(
      paidTicket.TicketItem.map((item) => [item.event.id, item.event])
    );

    for (const event of eventsById.values()) {
      if (!event.user.phone) continue;

      try {
        /* await sendEventRegistrationTemplate({
          to: event.user.phone,
          attendeeName: paidTicket.user.name,
          eventTitle: event.title,
          eventDate: formatEventDate(event.eventDate),
          location: event.location,
        }); */
      } catch (error) {
        console.error("Error enviando WhatsApp de pago:", error);
      }
    }

    return paidTicket;
  }

  private generateTicketNumber(id: string, title?: string, createdAt?: Date) {
    const shortId = id.split("-")[0].toUpperCase();
    const titlePart =
      title?.replace(/\s+/g, "").toUpperCase().slice(0, 10) || "EVENTO";
    const year = createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear();
    return `TCK-${shortId}-${titlePart}-${year}`;
  }

  private getEventMediaUrl(event: any): string | null {
    return event?.EventImage?.[0]?.url || event?.mediaUrl || null;
  }

  private mapTicketToResponse(ticket: any) {
    const event = ticket.TicketItem?.[0]?.event;
    const mediaUrl = this.getEventMediaUrl(event);
    const ticketNumber = this.generateTicketNumber(ticket.id, event?.title, ticket.createdAt);

    return {
      id: ticket.id,
      ticketNumber,
      subTotal: ticket.subTotal,
      tax: ticket.tax,
      total: ticket.total,
      itemsInOrder: ticket.TicketItem?.length ?? 0,
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
}
