import { Schema } from "mongoose";
import { TransactionStatus, TransactionType } from "src/models/interfaces/wallet.interface";

export interface GetTransactionsDTO {
  page: number;
  limit: number;
  search?: string;
}

export interface GetTransactionsByDateRangeDTO {
  startDate: Date;
  endDate: Date;
  page: number;
  limit: number;
  search?: string;
}

export interface FinanceEventDTO {
  _id: string;
  eventTitle: string;
  user_id: UserDTO // can be a User object, undefined, or null
}

export interface GetTransactionsByUserDTO {
  userId: string;
  page: number;
  limit: number;
}

export interface GetRefundsByDateRangeDTO {
  startDate: Date;
  endDate: Date;
  page: number;
  limit: number;
  search?: string;
}

export interface RevenueStats {
  totalRevenue: string;
  totalRevenueChange: number;
  todayRevenue: string;
  todayRevenueChange: number;
  monthlyRevenue: string;
  monthlyRevenueChange: number;
}

// export interface Ticket {
//   type: string;
//   price: number;
//   quantity: number;
//   usedTickets: number;
//   totalPrice: number;
//   uniqueId: string;
//   uniqueQrCode: string;
//   status: string;
//   _id: string; 
// }

export interface UserDTO {
  _id: string;    
  name: string;
  email: string;
}


export interface ITicket {
  type: string;
  price: number;
  quantity: number;
  usedTickets: number;
  totalPrice: number;
  uniqueId: string;
  uniqueQrCode: string;
  status: string;
  _id: string;
}


// interface IEventInfo {
//   _id: ObjectId;
//   user_id: ObjectId;
//   eventTitle: string;
// }

export interface IBooking {
  _id: string;
  bookingId: string;
  userId: UserDTO;
  eventId: FinanceEventDTO;
  tickets: ITicket[];
  totalAmount: number;
  paymentType: string;
  discount: number;
  coupon: string;
  stripeSessionId: string;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}
export interface IPaginatedBookingsResponse {
  data: IBooking[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface ITransactionDTO {
  date: Date;
  eventName: string;
  eventId:  Schema.Types.ObjectId | string;
  transactionId: string;
  amount: number;
  type: TransactionType;
  balance: number;
  status: TransactionStatus;
  description?: string;
  reference?: string;
  metadata?: Record<string,{}>;
  userId: string; 
}