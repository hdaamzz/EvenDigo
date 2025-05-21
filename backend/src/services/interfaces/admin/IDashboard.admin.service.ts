
export interface IDashboardService {
  getDashboardStats(): Promise<any>;
  getRevenueChart(period: string): Promise<any>;
  getRecentTransactions(limit: number): Promise<any[]>;
  getSubscriptionPlans(): Promise<any[]>;
  getRecentActivities(limit: number): Promise<any[]>;
  getUpcomingEvents(limit: number): Promise<any[]>;
  getUserRegistrationStats(period: string): Promise<any>;
}