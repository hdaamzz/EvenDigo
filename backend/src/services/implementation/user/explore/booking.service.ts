import { inject, injectable } from 'tsyringe';
import { Schema } from 'mongoose';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import { IBookingService } from '../../../../../src/services/interfaces/user/explore/IBookingService';
import { IEventRepository } from '../../../../../src/repositories/interfaces/IEvent.repository';
import { IBookingRepository } from '../../../../../src/repositories/interfaces/IBooking.repository';
import { IUserRepository } from '../../../../../src/repositories/interfaces/IUser.repository';
import { IBooking, ITicket } from '../../../../../src/models/interfaces/booking.interface';
import { NotFoundException } from '../../../../../src/error/error-handlers';
import { generateAndUploadQrCode, generateUniqueId } from '../../../../../src/utils/helpers';
import { IUser } from '../../../../../src/models/interfaces/auth.interface';

@injectable()
export class BookingService implements IBookingService {
  constructor(
    @inject("BookingRepository") private bookingRepository: IBookingRepository,
    @inject("EventRepository") private eventRepository: IEventRepository,
    @inject("UserRepository") private userRepository: IUserRepository
  ) {}

  async getBookingDetails(sessionId: string): Promise<IBooking | null> {
    try {
      if (!sessionId) throw new Error('SESSION_ID is required');
      return this.bookingRepository.findByStripeSessionId(sessionId);
    } catch (error) {
      console.error("Error in Fetching booking details ", error);
      throw new Error(`Failed to Fetch Booking Details: ${(error as Error).message}`);
    }
  }

  async prepareTicketDetails(
    eventId: Schema.Types.ObjectId | string,
    tickets: { [type: string]: number },
    bookingId: string
  ): Promise<ITicket[]> {
    const event = await this.eventRepository.findEventById(eventId);
  
    if (!event) {
      throw new NotFoundException('Event not found');
    }
  
    const ticketDetails: ITicket[] = [];
  
    for (const [type, quantity] of Object.entries(tickets)) {
      if (quantity > 0) {
        const ticketInfo = event.tickets.find(
          ticket => ticket.type.toLowerCase() === type.toLowerCase()
        );
        
        if (!ticketInfo || !ticketInfo.price) {
          throw new Error(`Price not found for ticket type: ${type}`);
        }
        
        const price = ticketInfo.price;
  
        ticketDetails.push({
          type: ticketInfo.type,
          price,
          quantity,
          usedTickets: 0,
          totalPrice: price * quantity,
          uniqueId: generateUniqueId(),
          uniqueQrCode: await generateAndUploadQrCode(`${eventId}-${type}-${bookingId}`),
        });
      }
    }
  
    return ticketDetails;
  }

  async generateTicketsPdf(bookingId: string, userId: string): Promise<InstanceType<typeof PDFDocument> | null> {
    try {
      const booking = await this.bookingRepository.findBookingById(bookingId);
      
      if (!booking || booking.userId.toString() !== userId.toString()) {
        return null;
      }
      
      const event = await this.eventRepository.findEventById(booking.eventId);
      
      if (!event) {
        throw new NotFoundException('Event not found');
      }
      
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      
      doc.fontSize(25).text('Event Tickets', { align: 'center' });
      doc.moveDown();
      doc.fontSize(15).text(`Event: ${event.eventTitle}`, { align: 'left' });
      doc.fontSize(12).text(`Date: ${new Date(event.startDate).toLocaleDateString()}`, { align: 'left' });
      doc.fontSize(12).text(`Time: ${new Date(`1970-01-01T${event.startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, { align: 'left' });
      doc.fontSize(12).text(`Venue: ${event.venueName}, ${event.city}`, { align: 'left' });
      doc.moveDown();
      
      for (let i = 0; i < booking.tickets.length; i++) {
        const ticket = booking.tickets[i];
        doc.fontSize(14).text(`Ticket Type: ${ticket.type}`, { align: 'left' });
        doc.fontSize(12).text(`Quantity: ${ticket.quantity}`, { align: 'left' });
        doc.fontSize(12).text(`Price: ₹${ticket.price}`, { align: 'left' });
  
        if (ticket.uniqueQrCode) {
          const qrBuffer = await QRCode.toBuffer(ticket.uniqueQrCode);
          doc.image(qrBuffer, {
            fit: [150, 150],
            align: 'center',
            valign: 'center'
          });
        }
        
        doc.moveDown();
        
        if (i < booking.tickets.length - 1) {
          doc.addPage();
        }
      }
      
      return doc;
    } catch (error) {
      console.error('Error generating tickets PDF:', error);
      throw new Error(`Failed to generate tickets PDF: ${(error as Error).message}`);
    }
  }

  async generateInvoicePdf(bookingId: string, userId: string): Promise<InstanceType<typeof PDFDocument>| null> {
    try {
      const booking = await this.bookingRepository.findBookingById(bookingId);
      
      if (!booking || booking.userId.toString() !== userId.toString()) {
        return null;
      }
      
      const event = await this.eventRepository.findEventById(booking.eventId);
      
      if (!event) {
        throw new NotFoundException('Event not found');
      }
      
      const user: IUser | null = await this.userRepository.findById(booking.userId);
      
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      
      doc.fontSize(25).text('Invoice', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(15).text(`Invoice #${booking.bookingId}`, { align: 'left' });
      doc.fontSize(12).text(`Customer: ${user.name}`, { align: 'left' });
      doc.fontSize(12).text(`Customer Mail Id: ${user.email}`, { align: 'left' });
      doc.moveDown();
      
      doc.fontSize(14).text(`Event: ${event.eventTitle}`, { align: 'left' });
      doc.fontSize(12).text(`Date: ${new Date(event.startDate).toLocaleDateString()}`, { align: 'left' });
      doc.fontSize(12).text(`Time: ${new Date(`1970-01-01T${event.startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, { align: 'left' });
      doc.moveDown();
      
      doc.fontSize(14).text('Order Details:', { align: 'left' });
      doc.moveDown(0.5);
      
      const tableTop = doc.y;
      doc.fontSize(10).text('Item', 50, doc.y);
      doc.text('Quantity', 200, tableTop);
      doc.text('Price', 280, tableTop);
      doc.text('Total', 350, tableTop);
      doc.moveDown();
      
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
      
      let totalAmount = 0;
      
      booking.tickets.forEach(ticket => {
        const y = doc.y;
        const itemTotal = ticket.price * ticket.quantity;
        totalAmount += itemTotal;
        
        doc.fontSize(10).text(`${ticket.type} Ticket`, 50, y);
        doc.text(ticket.quantity.toString(), 200, y);
        doc.text(`₹${ticket.price.toFixed(2)}`, 280, y);
        doc.text(`₹${itemTotal.toFixed(2)}`, 350, y);
        doc.moveDown();
      });
      
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
      
      const taxRate = 0.1;
      const taxAmount = totalAmount * taxRate;
      const grandTotal = totalAmount + taxAmount;
      
      const rightAlignX = 350;
      
      doc.fontSize(10).text('Subtotal:', 280, doc.y);
      doc.text(`₹${totalAmount.toFixed(2)}`, rightAlignX, doc.y);
      doc.moveDown(0.5);
      
      doc.fontSize(10).text('Tax (10%):', 280, doc.y);
      doc.text(`₹${taxAmount.toFixed(2)}`, rightAlignX, doc.y);
      doc.moveDown(0.5);
      
      doc.fontSize(12).text('Total:', 280, doc.y,);
      doc.text(`₹${grandTotal.toFixed(2)}`, rightAlignX, doc.y);
      doc.moveDown();
      
      doc.moveDown();
      doc.fontSize(12).text('Payment Information', { align: 'left' });
      doc.fontSize(10).text(`Payment Method: ${booking.paymentType}`, { align: 'left' });
      doc.fontSize(10).text(`Payment Status: ${booking.paymentStatus}`, { align: 'left' });
      
      doc.fontSize(10).text('Thank you for your purchase!', 50, 700, { align: 'center' });
      
      return doc;
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw new Error(`Failed to generate invoice PDF: ${(error as Error).message}`);
    }
  }
}