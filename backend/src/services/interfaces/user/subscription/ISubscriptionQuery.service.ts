import { ISubscription } from '../../../../models/interfaces/subscription.interface';
import Stripe from 'stripe';

export interface SubscriptionPayload {
    planType: string;
    amount: number;
    successUrl: string;
    cancelUrl: string;
  }

export interface ISubscriptionQueryService {
  getCurrentActiveSubscription(userId: string): Promise<ISubscription | null>;
  cancelUserSubscription(userId: string, subscriptionId: string): Promise<{ success: boolean; message: string }>;
  verifyUserHasActiveSubscription(userId: string): Promise<boolean>;
  constructWebhookEvent(rawBody: any, signature: string, endpointSecret: string): Stripe.Event;
  handleSubscriptionWebhook(event: Stripe.Event): Promise<void>;
  addRefundToWallet(userId: string, amount: number, subscription: ISubscription): Promise<void>;
  calculateRefundAmount(subscription: ISubscription): number;
  deleteAllPendingSubscriptions(): Promise<{ deletedCount: number; success: boolean; message: string }>
  deleteAllCancelledSubscriptions(): Promise<{ deletedCount: number; success: boolean; message: string }> 
  updateExpiredSubscriptions(): Promise<{ modifiedCount: number; success: boolean; message: string }> 
}