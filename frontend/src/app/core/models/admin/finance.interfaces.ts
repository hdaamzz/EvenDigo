export interface StatCard {
    title: string;
    value: string;
    change: string;
    isNegative: boolean;
  }

 export interface Filter {
    startDate: string;
    endDate: string;
  }

  export interface StatCard {
    title: string;
    value: string;
    change: string;
    isNegative: boolean;
  }
  
  export interface RevenueDistribution {
    _id: string;
    event: string;
    eventName?: string;
    admin_percentage: number;
    total_revenue: number;
    total_participants: number;
    admin_amount: number;
    organizer_amount: number;
    is_distributed: boolean;
    distributed_at: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface RevenueStats {
    totalRevenue: number;
    totalRevenueChange: number;
    todayRevenue: number;
    todayRevenueChange: number;
    monthRevenue: number;
    monthRevenueChange: number;
  }