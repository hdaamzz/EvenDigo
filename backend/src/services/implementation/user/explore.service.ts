import { EventDocument } from "../../../models/interfaces/event.interface";
import Stripe from 'stripe';
import { IBookingRepository } from "../../../repositories/booking.repository";
import { IBooking, ITicket } from "../../../models/interfaces/booking.interface";
import { generateAndUploadQrCode, generateUniqueId } from "../../../utils/helpers";
import { Schema } from "mongoose";
import { inject, injectable } from "tsyringe";
import { IExploreService } from "../../../../src/services/interfaces/IExplore.service";
import { IDashboardRepository } from "../../../../src/repositories/interfaces/IEvent.repository";
import PDFDocument from 'pdfkit';
type PDFDocument = PDFKit.PDFDocument;
import QRCode from 'qrcode';
import { IUserRepository } from "src/repositories/interfaces/IUser.repository";
import { IUser } from "src/models/interfaces/auth.interface";


@injectable()
export class ExploreService implements IExploreService{
  private stripe: Stripe;

  constructor(
    @inject("DashboardRepository") private dashboardRepository :IDashboardRepository,
    @inject("BookingRepository") private bookingRepository:IBookingRepository,
    @inject("UserRepository") private userRepository:IUserRepository,
  ) {
    const stripeKey = process.env.STRIPE_KEY;
    if (!stripeKey) {
      throw new Error('STRIPE_KEY environment variable is not set');
    }
    this.stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' });
  }

  async getEvents(id: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    if (!id) throw new Error('ID is required');
    return this.dashboardRepository.findAllEventWithoutCurrentUser(id);
  }
  
  async getEvent(id: Schema.Types.ObjectId | string): Promise<EventDocument | null> {
    if (!id) throw new Error('ID is required');
    return this.dashboardRepository.findEventById(id);
  }

  async booking(
    eventId: string,
    tickets: { [type: string]: number },
    amount: number,
    successUrl: string,
    cancelUrl: string,
    userId: string,
    couponCode: string | null,
    discount: number
  ): Promise<Stripe.Checkout.Session> {
    try {
      // Validation
      if (!eventId || !userId) throw new Error('Event ID is required');
      if (!Object.keys(tickets).length) throw new Error('At least one ticket is required');
      if (amount <= 0) throw new Error('Amount must be greater than 0');
      if (!successUrl || !cancelUrl) throw new Error('Success and cancel URLs are required');

      // Prepare ticket details for storage
      
      let genaratedBookingId=`BK${Date.now()}${Math.floor(Math.random() * 10000)}`;
      const ticketDetails = await this.prepareTicketDetails(eventId, tickets,genaratedBookingId);
      // Create Stripe session
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `Tickets for Event ${eventId}`,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: { userId: userId.toString(), eventId, couponCode: couponCode || '' },
      });

      // Save booking
      await this.bookingRepository.createBooking({
        bookingId: genaratedBookingId,
        userId,
        eventId,
        tickets: ticketDetails,
        totalAmount: amount,
        paymentType: 'card',
        discount,
        coupon: couponCode,
        stripeSessionId: session.id,
        paymentStatus:"Pending"
      });

      return session;
    } catch (error) {
      throw new Error(`Booking failed: ${(error as Error).message}`);
    }
  }

  // New method to construct Stripe event from webhook
  constructStripeEvent(payload: Buffer, signature: string, secret: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error) {
      throw new Error(`Webhook error: ${(error as Error).message}`);
    }
  }

  // New method to process Stripe webhooks
  async processStripeWebhook(event: Stripe.Event): Promise<void> {
    try {      
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          if (session.payment_status === 'paid') {
            await this.updateBookingPaymentStatus(session.id);
          }
          break;
      }
    } catch (error) {
      console.error("Error in processStripeWebhook:", error);
      throw new Error(`Error processing webhook: ${(error as Error).message}`);
    }
  }
  // Helper method to update booking payment status
  private async updateBookingPaymentStatus(sessionId: string): Promise<void> {
    try {
      const booking = await this.bookingRepository.findByStripeSessionId(sessionId);
      
      if (!booking) {
        console.log("No booking found with session ID:", sessionId);
        throw new Error(`No booking found with session ID: ${sessionId}`);
      }
      // Update payment status
      booking.paymentStatus = 'Completed';
      await this.bookingRepository.updateBookingDetails(booking.bookingId, booking);
    } catch (error) {
      console.error("Error in updateBookingPaymentStatus:", error);
      throw new Error(`Failed to update booking status: ${(error as Error).message}`);
    }
  }

  private async prepareTicketDetails(
    eventId: Schema.Types.ObjectId | string,
    tickets: { [type: string]: number },
    bookingId: string
  ): Promise<ITicket[]> {
    const event = await this.getEvent(eventId);
    console.log(event);
  
    const ticketDetails: ITicket[] = [];
    if (!event) {
      throw new Error(`prepareTicketDetails Event not getting`);
    }
  
    for (const [type, quantity] of Object.entries(tickets)) {
      if (quantity > 0) {
        // Make case-insensitive comparison
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

  async getBookingDetails(sessionId:string):Promise<IBooking | null>{
    try {
      if (!sessionId) throw new Error('SESSION_ID is required');
      return this.bookingRepository.findByStripeSessionId(sessionId)
    } catch (error) {
      console.error("Error in Fetching booking details ", error);
      throw new Error(`Failed to Fetching Booking Details: ${(error as Error).message}`);
    }
  }


  async generateTicketsPdf(bookingId: string, userId: string): Promise<PDFDocument | null> {
    try {
      // Get booking details from repository
      const booking = await this.bookingRepository.findBookingById(bookingId);
      
      // Check if booking exists and belongs to user
      if (!booking || booking.userId.toString() !== userId.toString()) {
        return null;
      }
      
      // Get event details
      const event = await this.dashboardRepository.findEventById(booking.eventId);
      
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Create a PDF document
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      
      // Add content to the PDF
      doc.fontSize(25).text('Event Tickets', { align: 'center' });
      doc.moveDown();
      doc.fontSize(15).text(`Event: ${event.eventTitle}`, { align: 'left' });
      doc.fontSize(12).text(`Date: ${new Date(event.startDate).toLocaleDateString()}`, { align: 'left' });
      doc.fontSize(12).text(`Time: ${new Date(`1970-01-01T${event.startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, { align: 'left' });
      doc.fontSize(12).text(`Venue: ${event.venueName}, ${event.city}`, { align: 'left' });
      doc.moveDown();
      
      // Add tickets
      for (let i = 0; i < booking.tickets.length; i++) {
        const ticket = booking.tickets[i];
        doc.fontSize(14).text(`Ticket Type: ${ticket.type}`, { align: 'left' });
        doc.fontSize(12).text(`Quantity: ${ticket.quantity}`, { align: 'left' });
        doc.fontSize(12).text(`Price: ₹${ticket.price}`, { align: 'left' });
  
        // Add QR code for each ticket
        if (ticket.uniqueQrCode) {
          const qrBuffer = await QRCode.toBuffer(ticket.uniqueQrCode);
          doc.image(qrBuffer, {
            fit: [150, 150],
            align: 'center',
            valign: 'center'
          });
        }
        
        doc.moveDown();
        
        // Add a page break between tickets if not the last ticket
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

  async generateInvoicePdf(bookingId: string, userId: string): Promise<PDFDocument | null> {
    try {
      // Get booking details from repository
      const booking = await this.bookingRepository.findBookingById(bookingId);
      
      // Check if booking exists and belongs to user
      if (!booking || booking.userId.toString() !== userId.toString()) {
        return null;
      }
      
      // Get event details
      const event = await this.dashboardRepository.findEventById(booking.eventId);
      
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Get user details
      const user:IUser |null = await this.userRepository.findUserById(booking.userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Create a PDF document
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      
      // Add content to the PDF
      doc.fontSize(25).text('Invoice', { align: 'center' });
      doc.moveDown();
      
      // Add invoice header
      doc.fontSize(15).text(`Invoice #${booking.bookingId}`, { align: 'left' });
      // doc.fontSize(12).text(`Date: ${new Date(booking.createdAt).toLocaleDateString()}`, { align: 'left' });
      doc.fontSize(12).text(`Customer: ${user.name}`, { align: 'left' });
      doc.fontSize(12).text(`Customer Mail Id: ${user.email}`, { align: 'left' });
      doc.moveDown();
      
      // Add event details
      doc.fontSize(14).text(`Event: ${event.eventTitle}`, { align: 'left' });
      doc.fontSize(12).text(`Date: ${new Date(event.startDate).toLocaleDateString()}`, { align: 'left' });
      doc.fontSize(12).text(`Time: ${new Date(`1970-01-01T${event.startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, { align: 'left' });
      doc.moveDown();
      
      // Add ticket details table
      doc.fontSize(14).text('Order Details:', { align: 'left' });
      doc.moveDown(0.5);
      
      // Table headers
      const tableTop = doc.y;
      doc.fontSize(10).text('Item', 50, doc.y);
      doc.text('Quantity', 200, tableTop);
      doc.text('Price', 280, tableTop);
      doc.text('Total', 350, tableTop);
      doc.moveDown();
      
      // Draw a line
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
      
      // Table content and calculations
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
      
      // Add subtotal, tax, and total
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
      
      // Assumed tax rate of 10% - adjust as needed
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
      
      // Payment info
      doc.moveDown();
      doc.fontSize(12).text('Payment Information', { align: 'left' });
      doc.fontSize(10).text(`Payment Method: ${booking.paymentType}`, { align: 'left' });
      // doc.fontSize(10).text(`Payment Date: ${new Date(booking.createdAt).toLocaleDateString()}`, { align: 'left' });
      doc.fontSize(10).text(`Payment Status: ${booking.paymentStatus}`, { align: 'left' });
      
      // Footer
      doc.fontSize(10).text('Thank you for your purchase!', 50, 700, { align: 'center' });
      
      return doc;
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw new Error(`Failed to generate invoice PDF: ${(error as Error).message}`);
    }
  }

}