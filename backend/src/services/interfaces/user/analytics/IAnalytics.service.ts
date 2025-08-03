import { Schema } from 'mongoose';

export interface EventAnalytics {
  eventId: string;
  eventTitle: string;
  eventType: string;
  totalParticipants: number;
  totalRevenue: number;
  organizerRevenue: number;
  adminRevenue: number;
  adminPercentage: number;
  ticketBreakdown: Array<{
    type: string;
    soldTickets: number;
    totalTickets: number;
    revenue: number;
    price: number;
  }>;
  bookingStats: {
    totalBookings: number;
    successfulBookings: number;
    cancelledBookings: number;
  };
  paymentMethods: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
  participantGrowth: Array<{
    date: string;
    count: number;
  }>;
  isDistributed: boolean;
  distributedAt?: Date;
}

export interface IAnalyticsService {
  getEventAnalytics(eventId: Schema.Types.ObjectId | string, userId: Schema.Types.ObjectId | string): Promise<EventAnalytics>;
}