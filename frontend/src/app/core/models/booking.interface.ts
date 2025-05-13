import { IEvent } from "./event.interface";
import { User } from "./userModel";

export interface ITicket {
    type: string;
    price: number;
    quantity: number;
    usedTickets: number;
    totalPrice: number;
    status?:string;
    uniqueId: string;
    uniqueQrCode?: string;
}


export interface IBooking {
    bookingId: string;
    userId: User | string;
    eventId: IEvent ;
    event?: IEvent ;
    tickets: ITicket[];
    totalAmount: number;
    paymentType: string;
    discount?: number;
    coupon?: string | null;
    stripeSessionId?: string;
    paymentStatus: string;
    createdAt?:string;
    updatedAt?:string

}


export interface PayloadData  {
    eventId: string;
    tickets: {
        [type: string]: number;
    };
    amount: number;
    successUrl: string;
    cancelUrl: string;
    paymentMethod: "wallet" | "card" | null;
    couponCode: string;
    discount: number;
}


export interface BookingResponse {
     success:boolean;
     message?:string;
     data:IBooking
}

export interface AllBookingResponse {
    success:boolean;
    message?:string;
    data:IBooking[]
}