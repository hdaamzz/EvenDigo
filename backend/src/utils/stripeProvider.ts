import { injectable } from 'tsyringe';
import Stripe from 'stripe';

@injectable()
export class StripeProvider {
  private stripe: Stripe;

  constructor() {
    const stripeKey = process.env.STRIPE_KEY;
    if (!stripeKey) {
      throw new Error('STRIPE_KEY environment variable is not set');
    }
    this.stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' });
  }

  getInstance(): Stripe {
    return this.stripe;
  }
}