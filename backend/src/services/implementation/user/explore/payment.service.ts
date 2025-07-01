import { inject, injectable } from 'tsyringe';
import Stripe from 'stripe';
import { IPaymentService } from '../../../../services/interfaces/user/explore/IPaymentService';
import { IBookingRepository } from '../../../../repositories/interfaces/IBooking.repository';
import { IWalletRepository } from '../../../../repositories/interfaces/IWallet.repository';
import { IBookingService } from '../../../../services/interfaces/user/explore/IBookingService';
import { IEventRepository } from '../../../../repositories/interfaces/IEvent.repository';
import { IBooking } from '../../../../models/interfaces/booking.interface';
import { BadRequestException } from '../../../../error/error-handlers';
import { IWallet, TransactionType } from '../../../../models/interfaces/wallet.interface';
import { generateRandomId } from '../../../../utils/helpers';
import { IChatService } from '../../../../services/interfaces/user/chat/IChat.service';

@injectable()
export class PaymentService implements IPaymentService {
  private stripe: Stripe;

  constructor(
    @inject("BookingRepository") private bookingRepository: IBookingRepository,
    @inject("WalletRepository") private walletRepository: IWalletRepository,
    @inject("BookingService") private bookingService: IBookingService,
    @inject("EventRepository") private eventRepository: IEventRepository,
    @inject('ChatService') private chatService: IChatService

  ) {
    const stripeKey = process.env.STRIPE_KEY;
    if (!stripeKey) {
      throw new Error('STRIPE_KEY environment variable is not set');
    }
    this.stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' });
  }

  async createStripeCheckoutSession(
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
      this.validateCheckoutParams(eventId, userId, tickets, amount, successUrl, cancelUrl);

      const event = await this.eventRepository.findEventById(eventId);
      if (!event) {
        throw new BadRequestException('Event not found');
      }

      if (!event.tickets || event.tickets.length === 0) {
        throw new BadRequestException('No tickets available for this event');
      }

      await this.validateTicketAvailability(eventId, tickets);

      const genaratedBookingId = `BK${Date.now()}${Math.floor(Math.random() * 10000)}`;
      const ticketDetails = await this.bookingService.prepareTicketDetails(eventId, tickets, genaratedBookingId);
      
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
        metadata: { 
          userId: userId.toString(), 
          eventId, 
          paymentType: 'event_booking', 
          couponCode: couponCode || '',
          tickets: JSON.stringify(tickets)
        },
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
        paymentStatus: "Pending"
      });

      return session;
    } catch (error) {
      throw new Error(`Stripe checkout failed: ${(error as Error).message}`);
    }
  }

  async processWalletPayment(
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
        throw new BadRequestException('Wallet not found for this user');
      }
      
      if (wallet.walletBalance < amount) {
        throw new BadRequestException('Insufficient wallet balance');
      }
      
      const event = await this.eventRepository.findEventById(eventId);
      if (!event) {
        throw new BadRequestException('Event not found');
      }

      if (!event.tickets || event.tickets.length === 0) {
        throw new BadRequestException('No tickets available for this event');
      }
      
      this.validateCheckoutParams(eventId, userId, tickets, amount);
      
      await this.validateTicketAvailability(eventId, tickets);
      
      const generatedBookingId = `BK${Date.now()}${Math.floor(Math.random() * 10000)}`;
      const ticketDetails = await this.bookingService.prepareTicketDetails(eventId, tickets, generatedBookingId);
      const sessionId = generateRandomId();
      
      const booking = await this.bookingRepository.createBooking({
        bookingId: generatedBookingId,
        userId,
        eventId,
        tickets: ticketDetails,
        totalAmount: amount,
        paymentType: 'wallet',
        discount,
        coupon: couponCode,
        paymentStatus: 'Completed',
        stripeSessionId: sessionId
      });

      await this.eventRepository.updateTicketQuantities(eventId, tickets);
      const groupChat = await this.chatService.getGroupChatByEventId(eventId);
      if (groupChat) {
        await this.chatService.addParticipantToGroupChat(groupChat._id.toString(), userId);
      } else {
        console.warn(`No group chat found for event ${eventId}`);
      }

      await this.walletRepository.addTransaction(
        userId,
        {
          eventId: eventId,
          amount: amount,
          type: TransactionType.DEBIT,
          description: `Payment for booking #${generatedBookingId}`,
          metadata: {
            bookingId: generatedBookingId,
            tickets: ticketDetails.map(ticket => ({
              type: ticket.type,
              quantity: ticket.quantity
            }))
          }
        }
      );
      
      return booking;
    } catch (error) {
      console.error('Wallet payment error:', error);
      throw new Error(`Wallet payment failed: ${(error as Error).message}`);
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
            await this.updateBookingPaymentStatus(session.id, session.metadata);
          }
          break;
        case 'checkout.session.expired':
          const expiredSession = event.data.object as Stripe.Checkout.Session;
          await this.handleExpiredSession(expiredSession.id);
          break;
      }
    } catch (error) {
      console.error("Error in processStripeWebhook:", error);
      throw new Error(`Error processing webhook: ${(error as Error).message}`);
    }
  }

  private async updateBookingPaymentStatus(sessionId: string, metadata: any): Promise<void> {
    try {
      const booking = await this.bookingRepository.findByStripeSessionId(sessionId);

      const eventId =booking?.eventId as unknown as string
      const userId =booking?.userId as unknown as string

      const groupChat = await this.chatService.getGroupChatByEventId(eventId);
      if (groupChat) {
        await this.chatService.addParticipantToGroupChat(groupChat._id.toString(), userId);
      } else {
        console.warn(`No group chat found for event ${eventId}`);
      }
      if (!booking) {
        console.log("No booking found with session ID:", sessionId);
        throw new Error(`No booking found with session ID: ${sessionId}`);
      }

      booking.paymentStatus = 'Completed';
      await this.bookingRepository.updateBookingDetails(booking.bookingId, booking);
      
      if (metadata?.tickets) {
        const tickets = JSON.parse(metadata.tickets);
        await this.eventRepository.updateTicketQuantities(booking.eventId, tickets);
      }

    } catch (error) {
      console.error("Error in updateBookingPaymentStatus:", error);
      throw new Error(`Failed to update booking status: ${(error as Error).message}`);
    }
  }

  private async handleExpiredSession(sessionId: string): Promise<void> {
    try {
      const booking = await this.bookingRepository.findByStripeSessionId(sessionId);
      
      if (booking && booking.paymentStatus === 'Pending') {
        booking.paymentStatus = 'Failed';
        await this.bookingRepository.updateBookingDetails(booking.bookingId, booking);
        console.log(`Marked booking ${booking.bookingId} as failed due to expired session`);
      }
    } catch (error) {
      console.error("Error handling expired session:", error);
    }
  }

  private async validateTicketAvailability(eventId: string, tickets: { [type: string]: number }): Promise<void> {
    const event = await this.eventRepository.findEventById(eventId);
    if (!event) {
      throw new BadRequestException('Event not found');
    }

    for (const [type, requestedQuantity] of Object.entries(tickets)) {
      if(requestedQuantity>0){
        const availableTicket = event.tickets.find(t => t.type.toLowerCase() === type.toLowerCase());
      
      if (!availableTicket) {
        throw new BadRequestException(`Ticket type ${type} not found`);
      }
      
      if (availableTicket.quantity < requestedQuantity) {
        throw new BadRequestException(`Insufficient tickets available for ${type}. Available: ${availableTicket.quantity}, Requested: ${requestedQuantity}`);
      }
      }
      
    }
  }

  private validateCheckoutParams(
    eventId: string, 
    userId: string, 
    tickets: { [type: string]: number }, 
    amount: number,
    successUrl?: string,
    cancelUrl?: string
  ): void {
    if (!eventId || !userId) {
      throw new BadRequestException('Event ID and User ID are required');
    }
    
    if (!Object.keys(tickets).length) {
      throw new BadRequestException('At least one ticket is required');
    }
    
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }
    
    if (successUrl !== undefined && cancelUrl !== undefined) {
      if (!successUrl || !cancelUrl) {
        throw new BadRequestException('Success and cancel URLs are required');
      }
    }
  }
}