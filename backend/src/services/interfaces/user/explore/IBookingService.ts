import { Schema } from 'mongoose';
import { IBooking, ITicket } from '../../../../models/interfaces/booking.interface';
import PDFDocument from 'pdfkit';

export interface IBookingService {
  getBookingDetails(sessionId: string): Promise<IBooking | null>;
  generateTicketsPdf(bookingId: string, userId: string): Promise<InstanceType<typeof PDFDocument>| null>;
  generateInvoicePdf(bookingId: string, userId: string): Promise<InstanceType<typeof PDFDocument>| null>;
  prepareTicketDetails(
    eventId: Schema.Types.ObjectId | string,
    tickets: { [type: string]: number },
    bookingId: string
  ): Promise<ITicket[]>;
}