import { IEvent } from "../../models/event.interface";

export interface TicketItem {
  type: string;
  price: number;
  quantity: number;
}

export interface PaginatedEventResponse {
  success: boolean;
  data: {
    events: IEvent[];
    currentPage: number;
    totalPages: number;
    totalEvents: number;
    hasMore: boolean;
  };
  message: string;
}