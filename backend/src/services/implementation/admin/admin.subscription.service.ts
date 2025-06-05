import { inject, injectable } from 'tsyringe';
import { Schema } from 'mongoose';
import { IAdminSubscriptionService, PaginatedSubscriptions, SubscriptionFilter, SubscriptionFilterOptions, SubscriptionStats } from '../../../../src/services/interfaces/IAdminSubscription.service';
import { IUserRepository } from '../../../../src/repositories/interfaces/IUser.repository';
import { ISubscription, SubscriptionStatus, SubscriptionType } from '../../../models/SubscriptionModal';
import { ISubscriptionRepository } from '../../../../src/repositories/interfaces/ISubscription.repository';


@injectable()
export class AdminSubscriptionService implements IAdminSubscriptionService {
  constructor(
    @inject("SubscriptionRepository") private subscriptionRepository: ISubscriptionRepository,
    @inject("UserRepository") private userRepository: IUserRepository
  ) {}

  async getAllSubscriptions(page: number, limit: number, filters?: SubscriptionFilter): Promise<PaginatedSubscriptions> {
  try {
    const skip = (page - 1) * limit;
    
    const query: any = {};
    
    if (filters) {
      if (filters.activeOnly) {
        query.isActive = true;
        query.status = 'active';
      }
      
      if (filters.planType && filters.planType !== 'all') {
        query.type = filters.planType;
      }
      
      if (filters.searchTerm) {
        query.$or = [
          { subscriptionId: { $regex: filters.searchTerm, $options: 'i' } },
          { type: { $regex: filters.searchTerm, $options: 'i' } },
          { paymentMethod: { $regex: filters.searchTerm, $options: 'i' } }
        ];
      }
      
      if (filters.startDate && filters.endDate) {
        query.startDate = { 
          $gte: filters.startDate,
          $lte: filters.endDate
        };
      } else if (filters.startDate) {
        query.startDate = { $gte: filters.startDate };
      } else if (filters.endDate) {
        query.startDate = { $lte: filters.endDate };
      }
    } else {
      // Default to active subscriptions only
      query.isActive = true;
      query.status = 'active';
    }
    
    const totalItems = await this.subscriptionRepository.countSubscriptions(query);
    const subscriptions = await this.subscriptionRepository.findSubscriptionsWithPagination(query, skip, limit);
    const enhancedSubscriptions = await this.enhanceSubscriptionsWithUserInfo(subscriptions);
    
    return {
      subscriptions: enhancedSubscriptions,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems
      }
    };
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    throw new Error(`Failed to get subscriptions: ${(error as Error).message}`);
  }
}

  async getSubscriptionStats(): Promise<SubscriptionStats> {
    try {
      const allSubscriptions = await this.subscriptionRepository.findAllSubscriptions();
      
      const totalSubscriptions = allSubscriptions.length;
      const activeSubscriptions = allSubscriptions.filter((sub: ISubscription) => sub.isActive).length;
      const inactiveSubscriptions = totalSubscriptions - activeSubscriptions;
      const premiumSubscriptions = allSubscriptions.filter((sub: ISubscription) => sub.type === SubscriptionType.PREMIUM).length;
      const basicSubscriptions = allSubscriptions.filter((sub: ISubscription) => sub.type === SubscriptionType.STANDARD).length;
      
      // Calculate total revenue
      const totalRevenue = allSubscriptions.reduce((sum: number, sub: ISubscription) => sum + sub.amount, 0);
      
      return {
        totalSubscriptions,
        activeSubscriptions,
        inactiveSubscriptions,
        premiumSubscriptions,
        basicSubscriptions,
        totalRevenue
      };
    } catch (error) {
      console.error('Error getting subscription stats:', error);
      throw new Error(`Failed to get subscription statistics: ${(error as Error).message}`);
    }
  }

  async getSubscriptionById(id: string): Promise<ISubscription | null> {
    try {
      let subscription: ISubscription | null;
      
      // Check if ID is a subscription ID or ObjectId
      if (id.includes('ObjectId')) {
        subscription = await this.subscriptionRepository.findSubscriptionByObjectId(id);
      } else {
        subscription = await this.subscriptionRepository.findSubscriptionById(id);
      }
      
      if (!subscription) {
        return null;
      }
      
      const enhancedSubscriptions = await this.enhanceSubscriptionsWithUserInfo([subscription]);
      return enhancedSubscriptions[0];
    } catch (error) {
      console.error('Error getting subscription by ID:', error);
      throw new Error(`Failed to get subscription: ${(error as Error).message}`);
    }
  }


  async getSubscriptionBySessionId(sessionId: string): Promise<ISubscription | null> {
    try {
      let subscription: ISubscription | null;
      
      if (sessionId.includes('ObjectId')) {
        subscription = await this.subscriptionRepository.findSubscriptionByStripeSessionId(sessionId);
      } else {
        subscription = await this.subscriptionRepository.findSubscriptionByStripeSessionId(sessionId);
      }
      
      if (!subscription) {
        return null;
      }

      return subscription
    } catch (error) {
      console.error('Error getting subscription by ID:', error);
      throw new Error(`Failed to get subscription: ${(error as Error).message}`);
    }
  }



  async getUserSubscriptions(userId: Schema.Types.ObjectId | string): Promise<ISubscription[]> {
    try {
      const subscriptions = await this.subscriptionRepository.findAllSubscriptionsByUserId(userId);
      return subscriptions;
    } catch (error) {
      console.error('Error getting user subscriptions:', error);
      throw new Error(`Failed to get user subscriptions: ${(error as Error).message}`);
    }
  }

  async updateSubscriptionStatus(id: string, isActive: boolean): Promise<ISubscription | null> {
    try {
      let subscription: ISubscription | null;
      
      // Check if ID is a subscription ID or ObjectId
      if (id.includes('ObjectId')) {
        subscription = await this.subscriptionRepository.findSubscriptionByObjectId(id);
      } else {
        subscription = await this.subscriptionRepository.findSubscriptionById(id);
      }
      
      if (!subscription) {
        return null;
      }
      
      const status = isActive ? SubscriptionStatus.ACTIVE : SubscriptionStatus.INACTIVE;
      
      // Update the subscription
      const updatedSubscription = await this.subscriptionRepository.updateSubscription(
        subscription.subscriptionId,
        {
          isActive,
          status
        }
      );
      
      return updatedSubscription;
    } catch (error) {
      console.error('Error updating subscription status:', error);
      throw new Error(`Failed to update subscription status: ${(error as Error).message}`);
    }
  }

  async deleteSubscription(id: string): Promise<boolean> {
    try {
      let subscription: ISubscription | null;
      
      // Check if ID is a subscription ID or ObjectId
      if (id.includes('ObjectId')) {
        subscription = await this.subscriptionRepository.findSubscriptionByObjectId(id);
      } else {
        subscription = await this.subscriptionRepository.findSubscriptionById(id);
      }
      
      if (!subscription) {
        return false;
      }
      
      // Delete the subscription
      await this.subscriptionRepository.deleteSubscription(subscription.subscriptionId);
      
      return true;
    } catch (error) {
      console.error('Error deleting subscription:', error);
      throw new Error(`Failed to delete subscription: ${(error as Error).message}`);
    }
  }

  async getFilterOptions(): Promise<SubscriptionFilterOptions> {
    try {
      return {
        statuses: [
          { value: 'all', label: 'All Statuses' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' }
        ],
        planTypes: [
          { value: 'all', label: 'All Plan Types' },
          { value: SubscriptionType.PREMIUM, label: 'Premium' },
          { value: SubscriptionType.STANDARD, label: 'Basic' }
        ]
      };
    } catch (error) {
      console.error('Error getting filter options:', error);
      throw new Error(`Failed to get filter options: ${(error as Error).message}`);
    }
  }

  private async enhanceSubscriptionsWithUserInfo(subscriptions: ISubscription[]): Promise<ISubscription[]> {
    try {
      // Create a map for efficient user lookups
      const userMap = new Map();
      
      // Get unique user IDs
      const userIds = [...new Set(subscriptions.map(sub => sub.userId.toString()))];
      
      // Fetch users in bulk
      for (const userId of userIds) {
        const user = await this.userRepository.findUserById(userId);
        if (user) {
          userMap.set(userId.toString(), user);
        }
      }
      
      // Enhance subscriptions with user info
      return subscriptions.map(subscription => {
        const sub = subscription.toObject ? subscription.toObject() : { ...subscription };
        const user = userMap.get(sub.userId.toString());
        
        if (user) {
          // @ts-ignore: Adding userName property
          sub.userName = user.name || user.email || 'Unknown User';
        } else {
          // @ts-ignore: Adding userName property
          sub.userName = 'Unknown User';
        }
        
        return sub as ISubscription;
      });
    } catch (error) {
      console.error('Error enhancing subscriptions with user info:', error);
      return subscriptions;
    }
  }
}