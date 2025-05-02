import { ISubscription } from '../../../src/models/user/SubscriptionModal';
import Stripe from 'stripe';

export interface SubscriptionPayload {
  planType: string;
  amount: number;
  successUrl: string;
  cancelUrl: string;
}

export interface ISubscriptionService {
  
  createStripeSubscription(userId: string, payload: SubscriptionPayload): Promise<{ sessionId: string }>;
  
  processWalletSubscription(userId: string, payload: SubscriptionPayload): Promise<ISubscription>;
  
  getCurrentSubscription(userId: string): Promise<ISubscription | null>;
  
  cancelSubscription(userId: string, subscriptionId: string): Promise<{ success: boolean; message: string }>;
  
  handleSubscriptionWebhook(event: Stripe.Event): Promise<void> 
  
  verifyUserHasActiveSubscription(userId: string): Promise<boolean>;
  
  constructWebhookEvent(rawBody: any, signature: string, endpointSecret: string): Stripe.Event;
}