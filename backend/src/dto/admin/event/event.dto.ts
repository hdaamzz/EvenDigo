interface TicketDTO {
  type: string;
  price: number;
  quantity: number;
}

interface UserDTO {
  _id: string;
  username?: string;
  email?: string;
  // Add other user fields as needed
}

export interface AdminEventDTO {
  _id: string;
  user_id: UserDTO | string; 
  eventTitle: string;
  eventDescription: string;
  eventType: string;
  startDate: Date;
  startTime: string;
  endingDate: Date;
  endingTime: string;
  eventVisibility: string;
  venueName: string;
  venueAddress: string;
  city: string;
  tickets: TicketDTO[];
  ageRestriction: boolean;
  mainBanner: string;
  promotionalImage: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminEventListDTO {
   _id: string;
  user_id: UserDTO | string; 
  eventTitle: string;
  eventDescription: string;
  eventType: string;
  startDate: Date;
  startTime: string;
  endingDate: Date;
  endingTime: string;
  eventVisibility: string;
  venueName: string;
  venueAddress: string;
  city: string;
  tickets: TicketDTO[];
  ageRestriction: boolean;
  mainBanner: string;
  promotionalImage: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}