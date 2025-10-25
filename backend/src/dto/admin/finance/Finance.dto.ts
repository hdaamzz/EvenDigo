import { RevenueTransactions } from "src/services/interfaces/IRevenue.service";
import { FinanceEventDTO, RevenueStats, ITicket, UserDTO, IBooking, ITransactionDTO } from "./finance.input.dto";

export class RevenueStatsDto {
  totalRevenue: string;
  totalRevenueChange: number;
  todayRevenue: string;
  todayRevenueChange: number;
  monthlyRevenue: string;
  monthlyRevenueChange: number;

  constructor(data: RevenueStats) {
    this.totalRevenue = data.totalRevenue;
    this.totalRevenueChange = data.totalRevenueChange;
    this.todayRevenue = data.todayRevenue;
    this.todayRevenueChange = data.todayRevenueChange;
    this.monthlyRevenue = data.monthlyRevenue;
    this.monthlyRevenueChange = data.monthlyRevenueChange;
  }
}

export class TicketDto {
  type: string;
  price: number;
  quantity: number;
  usedTickets: number;
  totalPrice: number;
  uniqueId: string;
  uniqueQrCode: string;
  status?: string;

  constructor(ticket: ITicket) {    
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

export class BookingUserDto {
  _id: string;
  name: string;
  email?: string;

  constructor(user: UserDTO) {
    this._id = user._id;
    this.name = user.name;
    this.email = user.email;
  }
}

export class BookingEventDto {
  _id: string;
  eventTitle: string;
  user_id: BookingUserDto;

  constructor(event: FinanceEventDTO) {
    this._id = event._id;
    this.eventTitle = event.eventTitle;
    this.user_id = event.user_id ? new BookingUserDto(event.user_id) : event.user_id;
  }
}

export class RevenueTransactionDto {
  _id: string;
  bookingId: string;
  userId: BookingUserDto;
  eventId: BookingEventDto;
  tickets: TicketDto[];
  totalAmount: number;
  paymentType: string;
  discount?: number;
  coupon?: string | null;
  stripeSessionId?: string;
  paymentStatus?: string;
  createdAt: Date;
  updatedAt?: Date;

  constructor(booking: IBooking) {
    
    this._id = booking._id;
    this.bookingId = booking.bookingId;
    this.userId = booking.userId ? new BookingUserDto(booking.userId) : booking.userId;
    this.eventId = booking.eventId ? new BookingEventDto(booking.eventId) : booking.eventId;
    this.tickets = booking.tickets?.map((ticket: any) => new TicketDto(ticket)) || [];
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

export class RefundTransactionDto {
  transactionId: string;
  date: Date;
  description: string;
  amount: number;
  type: string;
  status: string;
  metadata: Record<string, {}>;
  userId: string;

  constructor(refund: ITransactionDTO) {    
    this.transactionId = refund.transactionId;
    this.date = refund.date;
    this.description = refund.description??"";
    this.amount = refund.amount;
    this.type = refund.type;
    this.status = refund.status;
    this.metadata = refund.metadata || {};
    this.userId = refund.userId;
  }
}

export class PaginatedRevenueTransactionsDto {
  data: RevenueTransactionDto[];
  totalItems: number;
  currentPage: number;
  totalPages: number;

  constructor(response: RevenueTransactions ) {
    this.data = response.data?.map((transaction: IBooking) => new RevenueTransactionDto(transaction)) || [];
    this.totalItems = response.totalItems;
    this.currentPage = response.currentPage;
    this.totalPages = response.totalPages;
  }
}

export class PaginatedRefundTransactionsDto {
  data: RefundTransactionDto[];
  totalItems: number;
  currentPage: number;
  totalPages: number;

  constructor(response: RevenueTransactions) {    
    this.data = response.data?.map((refund: ITransactionDTO) => new RefundTransactionDto(refund)) || [];
    this.totalItems = response.totalItems;
    this.currentPage = response.currentPage;
    this.totalPages = response.totalPages;
  }
}