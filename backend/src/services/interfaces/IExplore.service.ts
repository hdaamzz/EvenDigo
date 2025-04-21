import Stripe from 'stripe';
import { Schema } from 'mongoose';
import { EventDocument } from '../../models/interfaces/event.interface';
import { IBooking } from 'src/models/interfaces/booking.interface';
import PDFDocument from 'pdfkit';
type PDFDocument = PDFKit.PDFDocument;


export interface IExploreService {
  getEvents(id: Schema.Types.ObjectId | string): Promise<EventDocument[]>;
  getEvent(id: Schema.Types.ObjectId | string): Promise<EventDocument | null>;
  booking(
    eventId: string,
    tickets: { [type: string]: number },
    amount: number,
    successUrl: string,
    cancelUrl: string,
    userId: string,
    couponCode: string | null,
    discount: number
  ): Promise<Stripe.Checkout.Session>;
  walletBooking(
      eventId: string,
      tickets: { [type: string]: number },
      amount: number,
      userId: string,
      couponCode: string | null,
      discount: number
    ): Promise<IBooking> 
  processWalletPayment(bookingData: any): Promise<IBooking>
  constructStripeEvent(payload: Buffer, signature: string, secret: string): Stripe.Event;
  processStripeWebhook(event: Stripe.Event): Promise<void>;
  getBookingDetails(sessionId:string):Promise<IBooking | null>;
  generateTicketsPdf(bookingId: string, userId: string): Promise<PDFDocument | null> 
  generateInvoicePdf(bookingId: string, userId: string): Promise<PDFDocument | null> 
}
