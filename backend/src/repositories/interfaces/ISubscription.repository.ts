import { Schema } from 'mongoose';
import { ISubscription, SubscriptionStatus } from '../../../src/models/user/SubscriptionModal';

export interface ISubscriptionRepository {
  createSubscription(subscriptionData: Partial<ISubscription>): Promise<ISubscription>;

  findSubscriptionById(subscriptionId: string): Promise<ISubscription | null>;

  findSubscriptionByStripeSessionId(sessionId: string): Promise<ISubscription | null>;

  findActiveSubscriptionByUserId(userId: Schema.Types.ObjectId | string): Promise<ISubscription | null>;

  updateSubscriptionStatus(subscriptionId: string, status: SubscriptionStatus): Promise<ISubscription | null>;

  cancelSubscription(subscriptionId: string): Promise<ISubscription | null>;

  findAllSubscriptionsByUserId(userId: Schema.Types.ObjectId | string): Promise<ISubscription[]>;

  updateSubscription(subscriptionId: string, updateData: Partial<ISubscription>): Promise<ISubscription | null>;

  findSubscriptionByObjectId(id: string): Promise<ISubscription | null>;
  countSubscriptions(query: any): Promise<number>;


  findSubscriptionsWithPagination(query: any, skip: number, limit: number): Promise<ISubscription[]>;
  findAllSubscriptions(): Promise<ISubscription[]>;
  deleteSubscription(subscriptionId: string): Promise<boolean>;
}