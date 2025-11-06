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
    return await prisma.ticket.findMany({
      where: { userId },
      include: {
        TicketItem: {
          include: { event: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
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
