export interface RevenueData {
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

export interface DateRange {
  startDate: Date;
  endDate: Date;
}


export interface Transaction {
  bookingId?: string;
  eventName: string;
  organizer: string;
  date: string;
  participant?: string;
  ticketDetails?: string;
  ticketType?: string;
  paymentType?: string;
  amount: string;
  status: string;
  statusClass?: string;
  rawData?: any;
}


export interface RevenueStats {
  totalRevenue: string;
  totalRevenueChange: number;
  todayRevenue: string;
  todayRevenueChange: number;
  monthlyRevenue: string;
  monthlyRevenueChange: number;
}


export interface BookingDetail {
  bookingId: string;
  eventName: string;
  eventId: string;
  organizer: string;
  participant: string;
  ticketDetails: Array<{
    type: string;
    price: number;
    quantity: number;
    usedTickets: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  discount: number;
  couponCode?: string;
  paymentStatus: string;
  paymentType: string;
  paymentDate: string;
  stripeSessionId?: string;
}


export interface FinanceApiResponse<T> {
  success: boolean;
  data: T;
  totalItems?: number;
  message?: string;
}
