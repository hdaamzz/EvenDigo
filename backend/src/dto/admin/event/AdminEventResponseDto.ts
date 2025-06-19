export interface AdminEventListDto {
  id: string;
  eventTitle: string;
  eventType: string;
  startDate: string;
  endingDate: string;
  city: string;
  venueName: string;
  status: boolean;
  ticketTypes: number;
  totalTickets: number;
  organizer: {
    id: string;
    name: string;
    email?: string;
  };
  createdAt: string;
}

export interface AdminEventDetailDto extends AdminEventListDto {
  eventDescription: string;
  startTime: string;
  endingTime: string;
  eventVisibility: string;
  venueAddress: string;
  ageRestriction: boolean;
  mainBanner: string;
  promotionalImage?: string;
  tickets: AdminTicketDto[];
  updatedAt: string;
}

export interface AdminTicketDto {
  type: string;
  price: number;
  quantity: number;
}

export interface AdminEventStatusUpdateDto {
  status: boolean;
}