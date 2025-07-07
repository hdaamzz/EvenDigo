import { Schema } from "mongoose";
import { ISubscription } from "../../models/interfaces/subscription.interface";

export interface SubscriptionFilter {
  activeOnly?: boolean;
  planType?: string;
  searchTerm?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  inactiveSubscriptions: number;
  premiumSubscriptions: number;
  basicSubscriptions: number;
  totalRevenue: number;
}

export interface SubscriptionFilterOptions {
  statuses: Array<{ value: string, label: string }>;
  planTypes: Array<{ value: string, label: string }>;
}

export interface PaginationInfo {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface PaginatedSubscriptions {
  subscriptions: ISubscription[];
  pagination: PaginationInfo;
}

export interface IAdminSubscriptionService {
  getAllSubscriptions(page: number, limit: number, filters?: SubscriptionFilter): Promise<PaginatedSubscriptions>;
  getSubscriptionStats(): Promise<SubscriptionStats>;
  getSubscriptionById(id: string): Promise<ISubscription | null>;
  getUserSubscriptions(userId: Schema.Types.ObjectId | string): Promise<ISubscription[]>;
  updateSubscriptionStatus(id: string, isActive: boolean): Promise<ISubscription | null>;
  deleteSubscription(id: string): Promise<boolean>;
  getFilterOptions(): Promise<SubscriptionFilterOptions>;
  getSubscriptionBySessionId(sessionId: string): Promise<ISubscription | null>
}