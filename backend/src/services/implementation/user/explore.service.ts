import { EventDocument } from "../../../models/interfaces/event.interface";
import Stripe from 'stripe';
import { IBooking, ITicket } from "../../../models/interfaces/booking.interface";
import { generateAndUploadQrCode, generateUniqueId } from "../../../utils/helpers";
import { Schema } from "mongoose";
import { inject, injectable } from "tsyringe";
import { IExploreService } from "../../../../src/services/interfaces/IExplore.service";
import { IEventRepository } from "../../../../src/repositories/interfaces/IEvent.repository";
import PDFDocument from 'pdfkit';
type PDFDocument = PDFKit.PDFDocument;
import QRCode from 'qrcode';
import { IUserRepository } from "../../../../src/repositories/interfaces/IUser.repository";
import { IUser } from "../../../../src/models/interfaces/auth.interface";
import { IWalletRepository } from "src/repositories/interfaces/IWallet.repository";
import { IWallet, TransactionType } from "../../../../src/models/interfaces/wallet.interface";
import { error } from "console";
import { IBookingRepository } from "../../../../src/repositories/interfaces/IBooking.repository";


@injectable()
export class ExploreService implements IExploreService{
  private stripe: Stripe;

  constructor(
    @inject("EventRepository") private eventRepository :IEventRepository,
    @inject("BookingRepository") private bookingRepository:IBookingRepository,
    @inject("UserRepository") private userRepository:IUserRepository,
    @inject("WalletRepository") private walletRepository:IWalletRepository
  ) {
    const stripeKey = process.env.STRIPE_KEY;
    if (!stripeKey) {
      throw new Error('STRIPE_KEY environment variable is not set');
    }
    this.stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' });
  }

  async getEvents(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    if (!userId) throw new Error('ID is required');
    return this.eventRepository.findUpcomingEventsWithoutCurrentUser(userId);
  }
  
  async getEvent(eventId: Schema.Types.ObjectId | string): Promise<EventDocument | null> {
    if (!eventId) throw new Error('ID is required');
    return this.eventRepository.findEventById(eventId);
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
      if (!eventId || !userId) throw new Error('Event ID is required');
      if (!Object.keys(tickets).length) throw new Error('At least one ticket is required');
      if (amount <= 0) throw new Error('Amount must be greater than 0');
      if (!successUrl || !cancelUrl) throw new Error('Success and cancel URLs are required');

      
      let genaratedBookingId=`BK${Date.now()}${Math.floor(Math.random() * 10000)}`;
      const ticketDetails = await this.prepareTicketDetails(eventId, tickets,genaratedBookingId);
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
        metadata: { userId: userId.toString(), eventId,paymentType: 'event_booking', couponCode: couponCode || '' },
      });

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

  async walletBooking(
    eventId: string,
    tickets: { [type: string]: number },
    amount: number,
    userId: string,
    couponCode: string | null,
    discount: number
  ): Promise<IBooking> {
    try {
      const wallet: IWallet | null = await this.walletRepository.findWalletById(userId);
      
      if (!wallet) {
        throw new Error('Wallet not found for this user');
      }
      
      if (wallet.walletBalance < amount) {
        throw new Error('Insufficient wallet balance');
      }
      
      if (!eventId || !userId) throw new Error('Event ID and User ID are required');
      if (!Object.keys(tickets).length) throw new Error('At least one ticket is required');
      if (amount <= 0) throw new Error('Amount must be greater than 0');
      
      const generatedBookingId = `BK${Date.now()}${Math.floor(Math.random() * 10000)}`;
      
      const ticketDetails = await this.prepareTicketDetails(eventId, tickets, generatedBookingId);
      
      const event = await this.eventRepository.findEventById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      const booking: Partial<IBooking> = {
        bookingId: generatedBookingId,
        userId,
        eventId,
        tickets: ticketDetails,
        totalAmount: amount,
        paymentType: 'wallet',
        discount,
        coupon: couponCode,
        paymentStatus: "Pending",
      };
      
      return booking as IBooking;
    } catch (error) {
      console.error('Wallet booking error:', error);
      throw new Error(`Wallet booking failed: ${(error as Error).message}`);
    }
  }

  async processWalletPayment(bookingData: Partial<IBooking>): Promise<IBooking> {
    try {
      const booking = await this.bookingRepository.createBooking({
        ...bookingData,
        paymentStatus: 'Completed'
      });
      if(!bookingData.userId || !bookingData.tickets){
        throw error
      }

      

      await this.walletRepository.addTransaction(
        bookingData.userId,
        {
          eventId: bookingData.eventId,
          amount: bookingData.totalAmount,
          type: TransactionType.DEBIT,
          description: `Payment for booking #${bookingData.bookingId}`,
          metadata: {
            bookingId: bookingData.bookingId,
            tickets: bookingData.tickets.map((ticket: ITicket) => ({
              type: ticket.type,
              quantity: ticket.quantity
            }))
          }
        }
      );
      
      return booking;
    } catch (error) {
      console.error('Error processing wallet payment:', error);
      throw new Error(`Failed to process wallet payment: ${(error as Error).message}`);
    }
  }

  constructStripeEvent(payload: Buffer, signature: string, secret: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error) {
      throw new Error(`Webhook error: ${(error as Error).message}`);
    }
  }

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

  private async updateBookingPaymentStatus(sessionId: string): Promise<void> {
    try {
      const booking = await this.bookingRepository.findByStripeSessionId(sessionId);
      
      if (!booking) {
        console.log("No booking found with session ID:", sessionId);
        throw new Error(`No booking found with session ID: ${sessionId}`);
      }
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
      const booking = await this.bookingRepository.findBookingById(bookingId);
      
      if (!booking || booking.userId.toString() !== userId.toString()) {
        return null;
      }
      
      const event = await this.eventRepository.findEventById(booking.eventId);
      
      if (!event) {
        throw new Error('Event not found');
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

  async generateInvoicePdf(bookingId: string, userId: string): Promise<PDFDocument | null> {
    try {
      const booking = await this.bookingRepository.findBookingById(bookingId);
      
      if (!booking || booking.userId.toString() !== userId.toString()) {
        return null;
      }
      
      const event = await this.eventRepository.findEventById(booking.eventId);
      
      if (!event) {
        throw new Error('Event not found');
      }
      
      const user:IUser |null = await this.userRepository.findUserById(booking.userId);
      
      if (!user) {
        throw new Error('User not found');
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