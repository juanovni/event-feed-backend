// src/controllers/ticket.controller.ts
import { Request, Response } from "express";
import { TicketService } from "../../services/ticket/ticket.service";

const ticketService = new TicketService();

export class TicketController {
  async create(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const ticket = await ticketService.createTicket(String(userId), req.body);
      return res.status(201).json(ticket);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const tickets = await ticketService.getTicketsByUser(userId);
      return res.json(tickets);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async markAsPaid(req: Request, res: Response) {
    try {
      const { ticketId } = req.params;
      const { transactionId } = req.body;
      const ticket = await ticketService.markAsPaid(ticketId, transactionId);
      return res.json(ticket);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
