import { injectable } from 'tsyringe';
import Stripe from 'stripe';

@injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_KEY!, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async createPaymentIntent(amount: number, currency: string = 'inr'): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.create({
        amount: amount * 100, 
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to create payment intent: ${(error as Error).message}`);
    }
  }
  async createPayout(amount: number, userEmail: string): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      const simulatedPayout = {
        id: `po_${Date.now()}`,
        object: 'payout',
        amount: amount * 100,
        currency: 'inr',
        status: 'paid',
        created: Math.floor(Date.now() / 1000)
      };
      return {
        success: true,
        data: {
          payoutId: simulatedPayout.id,
          status: simulatedPayout.status
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Payout failed: ${(error as Error).message}`
      };
    }
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.retrieve(paymentIntentId);
  }
}
