export interface Subscription {
  id: string;
  userId: string;
  subscriptionId: string;
  type: string;
  amount: number;
  status: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  paymentMethod: string;
  stripeSessionId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt?: string;
  updatedAt?: string;
  userName?: string;
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  inactiveSubscriptions: number;
  premiumSubscriptions: number;
  basicSubscriptions: number;
  totalRevenue: number;
}

export interface SubscriptionFilter {
  status?: 'active' | 'inactive' | 'all';
  planType?: string;
  searchTerm?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface SubscriptionStatusUpdate {
  id: string;
  isActive: boolean;
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

export interface SubscriptionDialogResult {
  updated: boolean;
  subscription?: Subscription;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}