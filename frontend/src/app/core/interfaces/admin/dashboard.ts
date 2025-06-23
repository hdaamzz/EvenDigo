export type ViewType = 'dashboard' | 'users' | 'events' | 'coupons' | 'achievements' | 'finance' | 'subscription';
export type FinanceSectionType = 'revenue' | 'refunds' | 'bookings' | null;
export type SubscriptionSectionType = 'management' | 'plans' | null;
export interface StatCard {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

export interface Transaction {
  type: string;
  amount: string;
  icon: string;
  isPositive: boolean;
  timestamp: string;
  description: string;
}

export interface Subscription {
  name: string;
  users: number;
  percentage: number;
  icon: string;
  planId: string;
}

export interface Activity {
  title: string;
  timeAgo: string;
  icon: string;
  userId?: string;
  eventId?: string;
  activityType?: string;
  timestamp: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  organizer: {
    id: string;
    name: string;
    image: string;
  };
  ticketsSold: number;
  image: string;
}

export interface DashboardStats {
  totalCustomers: number;
  customerGrowth: number;
  activeEvents: number;
  eventGrowth: number;
  totalRevenue: number;
  revenueGrowth: number;
  ticketsSold: number;
  ticketsGrowth: number;
}

export interface NewCounts {
  newSubscriptions: number;
  newActivities: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}