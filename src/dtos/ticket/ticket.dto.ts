export interface CreateTicketItemDto {
  eventId: string;
  ticketTypeId: string;   // ID del EventTicketType
  quantity: number;
  eventTicketTypeId: string;
}

export interface CreateTicketDto {
  userId: string;
  items: CreateTicketItemDto[];
}
