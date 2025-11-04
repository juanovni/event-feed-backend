export interface CreateTicketItemDto {
  eventId: string;
  quantity: number;
  price: number;
}

export interface CreateTicketDto {
  userId: string;
  items: CreateTicketItemDto[];
}
