import { SubscriptionStatus, SubscriptionType } from "../../../models/SubscriptionModal";

export class AdminSubscriptionDto {
  _id: string;
  userId: string;
  subscriptionId: string;
  type: SubscriptionType;
  amount: number;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  paymentMethod: string;
  stripeSessionId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  userName?: string; 

  constructor(data: any) {
    this._id = data._id;
    this.userId = data.userId;
    this.subscriptionId = data.subscriptionId;
    this.type = data.type;
    this.amount = data.amount;
    this.status = data.status;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.isActive = data.isActive;
    this.paymentMethod = data.paymentMethod;
    this.stripeSessionId = data.stripeSessionId;
    this.stripeCustomerId = data.stripeCustomerId;
    this.stripeSubscriptionId = data.stripeSubscriptionId;
    this.cancelledAt = data.cancelledAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.userName = data.userName;
  }

  static fromSubscription(subscription: any): AdminSubscriptionDto {
    return new AdminSubscriptionDto(subscription);
  }

  static fromSubscriptions(subscriptions: any[]): AdminSubscriptionDto[] {
    return subscriptions.map(subscription => AdminSubscriptionDto.fromSubscription(subscription));
  }
}

export class AdminSubscriptionStatsDto {
  totalSubscriptions: number;
  activeSubscriptions: number;
  inactiveSubscriptions: number;
  premiumSubscriptions: number;
  basicSubscriptions: number;
  totalRevenue: number;

  constructor(data: any) {
    this.totalSubscriptions = data.totalSubscriptions;
    this.activeSubscriptions = data.activeSubscriptions;
    this.inactiveSubscriptions = data.inactiveSubscriptions;
    this.premiumSubscriptions = data.premiumSubscriptions;
    this.basicSubscriptions = data.basicSubscriptions;
    this.totalRevenue = data.totalRevenue;
  }

  static fromStats(stats: any): AdminSubscriptionStatsDto {
    return new AdminSubscriptionStatsDto(stats);
  }
}

export class AdminPaginatedSubscriptionsDto {
  subscriptions: AdminSubscriptionDto[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
  };

  constructor(data: any) {
    this.subscriptions = AdminSubscriptionDto.fromSubscriptions(data.subscriptions);
    this.pagination = data.pagination;
  }

  static fromPaginatedData(data: any): AdminPaginatedSubscriptionsDto {
    return new AdminPaginatedSubscriptionsDto(data);
  }
}

export class AdminFilterOptionsDto {
  statuses: Array<{ value: string; label: string }>;
  planTypes: Array<{ value: string; label: string }>;

  constructor(data: any) {
    this.statuses = data.statuses;
    this.planTypes = data.planTypes;
  }

  static fromFilterOptions(options: any): AdminFilterOptionsDto {
    return new AdminFilterOptionsDto(options);
  }
}