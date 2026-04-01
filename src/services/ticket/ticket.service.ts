// src/services/ticket.service.ts
import { CreateTicketDto } from "../../dtos/ticket/ticket.dto";
import prisma from "../../prisma/client";

export class TicketService {

  async createTicket(userId: string, data: CreateTicketDto) {
    const { items } = data;

    if (!items?.length) {
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

    // 2. Calcular totales usando precios del backend
    let subTotal = 0;

    for (const item of items) {
      const type = ticketTypes.find(t => t.id === item.eventTicketTypeId);
      subTotal += type?.price || 0 * item.quantity;
    }

    const tax = subTotal * 0.15; // ejemplo
    const total = subTotal + tax;

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
      where: { userId },
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
      where: { id: ticketId, userId },
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
    return prisma.ticket.update({
      where: { id: ticketId },
      data: { isPaid: true, paidAt: new Date(), transactionId },
    });
  }

  private calculateTotals(items: CreateTicketDto["items"], events: any[]) {
    return items.reduce(
      (totals, item) => {
        const event = events.find((e) => e.id === item.eventId);
        if (!event) throw new Error(`${item.eventId} no existe - 500`);

        const sub = event.cost * item.quantity;
        totals.subTotal += sub;
        totals.tax += sub * 0.15;
        totals.total += sub * 1.15;

        return totals;
      },
      { subTotal: 0, tax: 0, total: 0 }
    );
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
