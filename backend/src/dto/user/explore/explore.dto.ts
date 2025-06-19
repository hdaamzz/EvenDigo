export class TicketDto {
  type: string;
  price: number;
  quantity: number;

  constructor(ticket: any) {
    this.type = ticket.type;
    this.price = ticket.price;
    this.quantity = ticket.quantity;
  }
}

export class EventDto {
  _id: string;
  user_id: string;
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
  tickets: TicketDto[];
  ageRestriction: boolean;
  mainBanner: string;
  promotionalImage: string;
  status?: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(event: any) {
    this._id = event._id;
    this.user_id = event.user_id;
    this.eventTitle = event.eventTitle;
    this.eventDescription = event.eventDescription;
    this.eventType = event.eventType;
    this.startDate = event.startDate;
    this.startTime = event.startTime;
    this.endingDate = event.endingDate;
    this.endingTime = event.endingTime;
    this.eventVisibility = event.eventVisibility;
    this.venueName = event.venueName;
    this.venueAddress = event.venueAddress;
    this.city = event.city;
    this.tickets = event.tickets?.map((ticket: any) => new TicketDto(ticket)) || [];
    this.ageRestriction = event.ageRestriction;
    this.mainBanner = event.mainBanner;
    this.promotionalImage = event.promotionalImage;
    this.status = event.status;
    this.createdAt = event.createdAt;
    this.updatedAt = event.updatedAt;
  }
}

export class TicketBookingDto {
  type: string;
  price: number;
  quantity: number;
  usedTickets: number;
  totalPrice: number;
  uniqueId: string;
  uniqueQrCode: string;
  status?: string;

  constructor(ticket: any) {
    this.type = ticket.type;
    this.price = ticket.price;
    this.quantity = ticket.quantity;
    this.usedTickets = ticket.usedTickets;
    this.totalPrice = ticket.totalPrice;
    this.uniqueId = ticket.uniqueId;
    this.uniqueQrCode = ticket.uniqueQrCode;
    this.status = ticket.status;
  }
}

export class UserDto {
  _id: string;
  name: string;
  email: string;

  constructor(user: any) {
    this._id = user._id;
    this.name = user.name;
    this.email = user.email;
  }
}

export class BookingDto {
  _id?: string;
  bookingId: string;
  userId: string | UserDto;
  eventId: string | EventDto;
  tickets: TicketBookingDto[];
  totalAmount: number;
  paymentType: string;
  discount?: number;
  coupon?: string | null;
  stripeSessionId?: string;
  paymentStatus?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(booking: any, includePopulatedData: boolean = false) {
    this._id = booking._id;
    this.bookingId = booking.bookingId;
    
    if (includePopulatedData && booking.userId && typeof booking.userId === 'object') {
      this.userId = new UserDto(booking.userId);
    } else {
      this.userId = booking.userId;
    }
    
    if (includePopulatedData && booking.eventId && typeof booking.eventId === 'object') {
      this.eventId = new EventDto(booking.eventId);
    } else {
      this.eventId = booking.eventId;
    }
    
    this.tickets = booking.tickets?.map((ticket: any) => new TicketBookingDto(ticket)) || [];
    this.totalAmount = booking.totalAmount;
    this.paymentType = booking.paymentType;
    this.discount = booking.discount;
    this.coupon = booking.coupon;
    this.stripeSessionId = booking.stripeSessionId;
    this.paymentStatus = booking.paymentStatus;
    this.createdAt = booking.createdAt;
    this.updatedAt = booking.updatedAt;
  }
}