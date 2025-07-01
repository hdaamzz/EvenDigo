import { IBooking } from '../../../../models/interfaces/booking.interface';
import Stripe from 'stripe';


export interface IPaymentService {
  createStripeCheckoutSession(
    eventId: string,
    tickets: { [type: string]: number },
    amount: number,
    successUrl: string,
    cancelUrl: string,
    userId: string,
    couponCode: string | null,
    discount: number
  ): Promise<Stripe.Checkout.Session>;
  
  processWalletPayment(
    eventId: string,
    tickets: { [type: string]: number },
    amount: number,
    userId: string,
    couponCode: string | null,
    discount: number
  ): Promise<IBooking>;
  
  constructStripeEvent(payload: Buffer, signature: string, secret: string): Stripe.Event;
  processStripeWebhook(event: Stripe.Event): Promise<void>;
}