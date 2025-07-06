import { IBookingRepository } from '../../../repositories/interfaces/IBooking.repository';
import { IEventRepository } from '../../../repositories/interfaces/IEvent.repository';
import { IRevenueDistributionRepository } from '../../../repositories/interfaces/IRevenue.repository';
import { ISubscriptionRepository } from '../../../repositories/interfaces/ISubscription.repository';
import { IUserRepository } from '../../../repositories/interfaces/IUser.repository';
import { inject, injectable } from 'tsyringe';


@injectable()
export class DashboardService {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
    @inject('EventRepository') private eventRepository: IEventRepository,
    @inject('BookingRepository') private bookingRepository: IBookingRepository,
    @inject('RevenueDistributionRepository') private revenueDistributionRepository: IRevenueDistributionRepository,
    @inject('SubscriptionRepository') private subscriptionRepository: ISubscriptionRepository
  ) {}

  async getDashboardStats(): Promise<any> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const totalUsers = (await this.userRepository.findAll()).length;
      const users = await this.userRepository.findAll();
      const newUsers = users.filter(
        (user) => user.createdAt && new Date(user.createdAt) >= thirtyDaysAgo
      ).length;
      const customerGrowth = totalUsers > 0 ? Math.round((newUsers / totalUsers) * 100) : 0;

      const allEvents = await this.eventRepository.findAllEvents();
      const now = new Date();
      const activeEvents = allEvents.filter(
        (event) => event.endingDate && new Date(event.endingDate) >= now
      ).length;
      const newEvents = allEvents.filter(
        (event) => event.createdAt && new Date(event.createdAt) >= thirtyDaysAgo
      ).length;
      const eventGrowth = allEvents.length > 0 ? Math.round((newEvents / allEvents.length) * 100) : 0;

      const totalRevenue = await this.revenueDistributionRepository.findTotalRevenue();
      const previousMonthRevenue = await this.revenueDistributionRepository.findPreviousMonthRevenue();
      const currentMonthRevenue = await this.revenueDistributionRepository.findCurrentMonthRevenue();
      const revenueGrowth =
        previousMonthRevenue > 0
          ? Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)
          : currentMonthRevenue > 0
          ? 100
          : 0;

      const allBookings = await Promise.all(
        allEvents.map((event) =>
          this.bookingRepository.findBookingsByEventId(event._id as string, { paymentStatus: 'Completed' })
        )
      );
      const ticketsSold = allBookings.flat().reduce((total, booking) => total + booking.tickets.length, 0);

      const previousMonthBookings = await Promise.all(
        allEvents.map((event) =>
          this.bookingRepository.findBookingsByEventId(event._id as string, {
            paymentStatus: 'Completed',
            createdAt: { $gte: thirtyDaysAgo },
          })
        )
      );
      const previousTicketsSold = previousMonthBookings
        .flat()
        .reduce((total, booking) => total + booking.tickets.length, 0);
      const ticketsGrowth =
        ticketsSold > 0 ? Math.round(((ticketsSold - previousTicketsSold) / ticketsSold) * 100) : 0;

      return {
        totalCustomers: totalUsers,
        customerGrowth,
        activeEvents,
        eventGrowth,
        totalRevenue: Number(totalRevenue),
        revenueGrowth,
        ticketsSold,
        ticketsGrowth,
      };
    } catch (error) {
      throw new Error(`Failed to fetch dashboard stats: ${(error as Error).message}`);
    }
  }

  async getRevenueChart(period: string): Promise<any> {
    try {
      const currentDate = new Date();
      let labels: string[] = [];
      let data: number[] = [];

      if (period === 'monthly') {
        for (let i = 11; i >= 0; i--) {
          const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
          const monthName = startDate.toLocaleString('default', { month: 'short' });
          labels.push(`${monthName} ${startDate.getFullYear()}`);

          const revenue = await this.revenueDistributionRepository.findRevenueByDateRange(
            startDate.toISOString(),
            endDate.toISOString(),
            1,
            10,
            true
          );
          data.push(revenue.total);
        }
      } else if (period === 'weekly') {
        for (let i = 11; i >= 0; i--) {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() - i * 7);
          const startDate = new Date(endDate);
          startDate.setDate(startDate.getDate() - 7);
          labels.push(`Week ${Math.ceil((endDate.getDate() + endDate.getDay()) / 7)}`);

          const revenue = await this.revenueDistributionRepository.findRevenueByDateRange(
            startDate.toISOString(),
            endDate.toISOString(),
            1,
            10,
            true
          );
          data.push(revenue.total);
        }
      } else if (period === 'daily') {
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);
          labels.push(date.toLocaleDateString('default', { day: 'numeric', month: 'short' }));

          const revenue = await this.revenueDistributionRepository.findRevenueByDateRange(
            date.toISOString(),
            nextDate.toISOString(),
            1,
            10,
            true
          );
          data.push(revenue.total);
        }
      }

      return {
        labels,
        datasets: [
          {
            label: 'Revenue',
            data,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to fetch revenue chart data: ${(error as Error).message}`);
    }
  }

  async getRecentTransactions(limit: number): Promise<any[]> {
    try {
      const transactions = await this.revenueDistributionRepository.findRecentDistributedRevenue(limit);
      return transactions.map((transaction) => ({
        type: transaction.event ? 'Ticket Purchase' : 'Other',
        amount: `₹${Number(transaction.total_revenue).toFixed(2)}`,
        icon: 'fas fa-ticket-alt',
        isPositive: true,
        timestamp: transaction.distributed_at?.toISOString() || new Date().toISOString(),
        description: transaction.event && typeof transaction.event === 'object' ? `Tickets for ${(transaction.event as any).eventTitle}` : 'Revenue distribution',
      }));
    } catch (error) {
      throw new Error(`Failed to fetch recent transactions: ${(error as Error).message}`);
    }
  }

  async getSubscriptionPlans(): Promise<any[]> {
    try {
      const activeSubscriptions = await this.subscriptionRepository.findAllActiveSubscriptions();
      const totalSubscriptions = activeSubscriptions.length;
      const premiumCount = activeSubscriptions.filter((sub) => sub.type === 'premium').length;
      const standardCount = activeSubscriptions.filter((sub) => sub.type === 'standard').length;

      const premiumPercentage = totalSubscriptions > 0 ? Math.round((premiumCount / totalSubscriptions) * 100) : 0;
      const standardPercentage = totalSubscriptions > 0 ? Math.round((standardCount / totalSubscriptions) * 100) : 0;

      return [
        {
          name: 'Premium Plan',
          users: premiumCount,
          percentage: premiumPercentage,
          icon: 'fas fa-crown',
          planId: 'premium',
        },
        {
          name: 'Standard Plan',
          users: standardCount,
          percentage: standardPercentage,
          icon: 'fas fa-star',
          planId: 'standard',
        },
      ];
    } catch (error) {
      throw new Error(`Failed to fetch subscription plans: ${(error as Error).message}`);
    }
  }

  async getRecentActivities(limit: number): Promise<any[]> {
    try {
      const users = await this.userRepository.findAll();
      const events = await this.eventRepository.findAllEvents();
      const subscriptions = await this.subscriptionRepository.findAllSubscriptions();

      const activities = [
        ...users
          .filter((user) => user.createdAt)
          .map((user) => ({
            title: `${user.name} registered a new account`,
            timeAgo: this.getTimeAgo(user.createdAt!),
            icon: 'fas fa-user-plus',
            userId: user._id,
            activityType: 'registration',
            timestamp: user.createdAt!.toISOString(),
          })),
        ...events
          .filter((event) => event.createdAt && event.user_id)
          .map((event) => ({
            title: `${(event.user_id as any).name} created a new event`,
            timeAgo: this.getTimeAgo(event.createdAt!),
            icon: 'fas fa-calendar-plus',
            userId: event.user_id,
            eventId: event._id,
            activityType: 'event_creation',
            timestamp: event.createdAt!.toISOString(),
          })),
        ...subscriptions
          .filter((sub) => sub.createdAt)
          .map((sub) => ({
            title: `User subscribed to ${sub.type} Plan`,
            timeAgo: this.getTimeAgo(sub.createdAt!),
            icon: 'fas fa-crown',
            userId: sub.userId,
            activityType: 'subscription',
            timestamp: sub.createdAt!.toISOString(),
          })),
      ];

      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return activities.slice(0, limit);
    } catch (error) {
      throw new Error(`Failed to fetch recent activities: ${(error as Error).message}`);
    }
  }

  async getUpcomingEvents(limit: number): Promise<any[]> {
    try {
      const now = new Date();
      const events = await this.eventRepository.findAllEvents();
      return events
        .filter((event) => new Date(event.startDate) > now)
        .slice(0, limit)
        .map(async (event) => {
          const bookings = await this.bookingRepository.findBookingsByEventId(event._id as string, {
            paymentStatus: 'Completed',
          });
          const ticketsSold = bookings.reduce((total, booking) => total + booking.tickets.length, 0);

          return {
            id: event._id,
            title: event.eventTitle,
            date: event.startDate,
            location: `${event.venueName}, ${event.city}`,
            organizer: event.user_id
              ? {
                  id: (event.user_id as any)._id,
                  name: (event.user_id as any).name,
                  image: (event.user_id as any).profileImg,
                }
              : { id: '', name: 'Unknown', image: '' },
            ticketsSold,
            image: event.mainBanner,
          };
        });
    } catch (error) {
      throw new Error(`Failed to fetch upcoming events: ${(error as Error).message}`);
    }
  }

  async getUserRegistrationStats(period: string): Promise<any> {
    try {
      const currentDate = new Date();
      let labels: string[] = [];
      let data: number[] = [];
      const users = await this.userRepository.findAll();

      if (period === 'monthly') {
        for (let i = 11; i >= 0; i--) {
          const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
          const monthName = startDate.toLocaleString('default', { month: 'short' });
          labels.push(`${monthName} ${startDate.getFullYear()}`);

          const count = users.filter((user) => {
            const createdAt = new Date(user.createdAt!);
            return createdAt >= startDate && createdAt <= endDate;
          }).length;
          data.push(count);
        }
      } else if (period === 'weekly') {
        for (let i = 11; i >= 0; i--) {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() - i * 7);
          const startDate = new Date(endDate);
          startDate.setDate(startDate.getDate() - 7);
          labels.push(`Week ${Math.ceil((endDate.getDate() + endDate.getDay()) / 7)}`);

          const count = users.filter((user) => {
            const createdAt = new Date(user.createdAt!);
            return createdAt >= startDate && createdAt <= endDate;
          }).length;
          data.push(count);
        }
      } else if (period === 'daily') {
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);
          labels.push(date.toLocaleDateString('default', { day: 'numeric', month: 'short' }));

          const count = users.filter((user) => {
            const createdAt = new Date(user.createdAt!);
            return createdAt >= date && createdAt < nextDate;
          }).length;
          data.push(count);
        }
      }

      return {
        labels,
        datasets: [
          {
            label: 'User Registrations',
            data,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to fetch user registration stats: ${(error as Error).message}`);
    }
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  }
}