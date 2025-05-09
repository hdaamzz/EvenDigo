import { inject, injectable } from 'tsyringe';
import Stripe from 'stripe';
import { IPaymentService } from '../../../../../src/services/interfaces/user/explore/IPaymentService';
// import { IEventRepository } from '../../../../../src/repositories/interfaces/IEvent.repository';
import { IBookingRepository } from '../../../../../src/repositories/interfaces/IBooking.repository';
import { IWalletRepository } from '../../../../../src/repositories/interfaces/IWallet.repository';
import { IBookingService } from '../../../../../src/services/interfaces/user/explore/IBookingService';
import { IBooking } from '../../../../../src/models/interfaces/booking.interface';
import { BadRequestException } from '../../../../../src/error/error-handlers';
import { IWallet, TransactionType } from '../../../../../src/models/interfaces/wallet.interface';
import { generateRandomId } from '../../../../../src/utils/helpers';


@injectable()
export class PaymentService implements IPaymentService {
  private stripe: Stripe;

  constructor(
    // @inject("EventRepository") private eventRepository: IEventRepository,
    @inject("BookingRepository") private bookingRepository: IBookingRepository,
    @inject("WalletRepository") private walletRepository: IWalletRepository,
    @inject("BookingService") private bookingService: IBookingService
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
        metadata: { userId: userId.toString(), eventId, paymentType: 'event_booking', couponCode: couponCode || '' },
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
      
      this.validateCheckoutParams(eventId, userId, tickets, amount);
      
      const generatedBookingId = `BK${Date.now()}${Math.floor(Math.random() * 10000)}`;
      const ticketDetails = await this.bookingService.prepareTicketDetails(eventId, tickets, generatedBookingId);
      const sessionId = generateRandomId()
      
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
        stripeSessionId:sessionId
      });

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