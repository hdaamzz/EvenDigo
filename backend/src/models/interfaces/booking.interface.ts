import { Document, Schema } from 'mongoose';
import { IUser } from './auth.interface';
import { EventDocument } from './event.interface';

export interface ITicket {
    type: string;           
    price: number;          
    quantity: number;       
    usedTickets: number;     
    totalPrice: number;    
    uniqueId: string;       
    uniqueQrCode: string;   
    status?:string;
}

export interface IBooking extends Document {
    bookingId: string;
    userId: Schema.Types.ObjectId | string ;
    eventId: Schema.Types.ObjectId |string ;
    tickets: ITicket[];
    totalAmount: number;
    paymentType: string;
    discount?: number;
    coupon?: string | null;
    stripeSessionId?: string; 
    paymentStatus?:string;
    createdAt?:Date;
    
  }

  export interface IBookingResponce extends Document {
    bookingId: string;
    userId: IUser;
    eventId: EventDocument;
    tickets: ITicket[];
    totalAmount: number;
    paymentType: string;
    discount?: number;
    coupon?: string | null;
    stripeSessionId?: string; 
    paymentStatus?:string;

  }