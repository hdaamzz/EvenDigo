import { Model, Schema } from 'mongoose';
import { inject, injectable } from 'tsyringe';
import { ISubscriptionRepository } from '../interfaces/user/ISubscription.repository';
import { ISubscription, SubscriptionStatus } from '../../../src/models/user/SubscriptionModal';
import mongoose from 'mongoose';

@injectable()
export class SubscriptionRepository implements ISubscriptionRepository {
  constructor(
    @inject("SubscriptionModel") private subscriptionModel: Model<ISubscription>
  ) {}

  async createSubscription(subscriptionData: Partial<ISubscription>): Promise<ISubscription> {
    try {
      const subscription = new this.subscriptionModel(subscriptionData);
      return await subscription.save();
    } catch (error) {
      throw new Error(`Failed to create subscription: ${(error as Error).message}`);
    }
  }

  async findSubscriptionById(subscriptionId: string): Promise<ISubscription | null> {
    try {
      return await this.subscriptionModel.findOne({ subscriptionId }).exec();
    } catch (error) {
      throw new Error(`Failed to find subscription: ${(error as Error).message}`);
    }
  }

  async findSubscriptionByStripeSessionId(sessionId: string): Promise<ISubscription | null> {
    try {
      return await this.subscriptionModel.findOne({ stripeSessionId: sessionId }).exec();
    } catch (error) {
      throw new Error(`Failed to find subscription by Stripe session ID: ${(error as Error).message}`);
    }
  }

  async findActiveSubscriptionByUserId(userId: Schema.Types.ObjectId | string): Promise<ISubscription | null> {
    try {
      return await this.subscriptionModel.findOne({ 
        userId, 
        isActive: true,
        endDate: { $gt: new Date() } 
      }).exec();
    } catch (error) {
      throw new Error(`Failed to find active subscription: ${(error as Error).message}`);
    }
  }

  async updateSubscriptionStatus(subscriptionId: string, status: SubscriptionStatus): Promise<ISubscription | null> {
    try {
      return await this.subscriptionModel.findOneAndUpdate(
        { subscriptionId },
        { status },
        { new: true }
      ).exec();
    } catch (error) {
      throw new Error(`Failed to update subscription status: ${(error as Error).message}`);
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<ISubscription | null> {
    try {
      const now = new Date();
      return await this.subscriptionModel.findOneAndUpdate(
        { subscriptionId },
        { 
          status: SubscriptionStatus.CANCELLED,
          isActive: false,
          cancelledAt: now
        },
        { new: true }
      ).exec();
    } catch (error) {
      throw new Error(`Failed to cancel subscription: ${(error as Error).message}`);
    }
  }

  async findAllSubscriptionsByUserId(userId: Schema.Types.ObjectId | string): Promise<ISubscription[]> {
    try {
      return await this.subscriptionModel.find({ userId })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new Error(`Failed to find user subscriptions: ${(error as Error).message}`);
    }
  }

  async updateSubscription(subscriptionId: string, updateData: Partial<ISubscription>): Promise<ISubscription | null> {
    try {
      return await this.subscriptionModel.findOneAndUpdate(
        { subscriptionId },
        updateData,
        { new: true }
      ).exec();
    } catch (error) {
      throw new Error(`Failed to update subscription: ${(error as Error).message}`);
    }
  }

  // New methods required for admin functionality

  async findSubscriptionByObjectId(id: string): Promise<ISubscription | null> {
    try {
      // Check if the ID looks like a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id) && !id.includes('ObjectId')) {
        return null;
      }
      
      let objectId: mongoose.Types.ObjectId;
      
      // Handle both raw ObjectId and string representation
      if (id.includes('ObjectId')) {
        // Extract the actual ID from the string format
        const match = id.match(/ObjectId\(['"]?([0-9a-fA-F]{24})['"]?\)/);
        if (!match || !match[1]) {
          return null;
        }
        objectId = new mongoose.Types.ObjectId(match[1]);
      } else {
        objectId = new mongoose.Types.ObjectId(id);
      }
      
      return await this.subscriptionModel.findById(objectId).exec();
    } catch (error) {
      throw new Error(`Failed to find subscription by ObjectId: ${(error as Error).message}`);
    }
  }

  async countSubscriptions(query: any): Promise<number> {
    try {
      return await this.subscriptionModel.countDocuments(query).exec();
    } catch (error) {
      throw new Error(`Failed to count subscriptions: ${(error as Error).message}`);
    }
  }

  async findSubscriptionsWithPagination(query: any, skip: number, limit: number): Promise<ISubscription[]> {
    try {
      return await this.subscriptionModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
    } catch (error) {
      throw new Error(`Failed to find subscriptions with pagination: ${(error as Error).message}`);
    }
  }

  async findAllSubscriptions(): Promise<ISubscription[]> {
    try {
      return await this.subscriptionModel.find()
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new Error(`Failed to find all subscriptions: ${(error as Error).message}`);
    }
  }

  async deleteSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const result = await this.subscriptionModel.deleteOne({ subscriptionId }).exec();
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Failed to delete subscription: ${(error as Error).message}`);
    }
  }
}