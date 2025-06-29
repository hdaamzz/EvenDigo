import { Schema } from 'mongoose';
import { ServiceResponse } from '../../../../src/models/interfaces/auth.interface';
import { IRevenueDistribution } from '../../../../src/models/interfaces/distribution.interface';
import { TransactionType } from '../../../../src/models/interfaces/wallet.interface';
import { IBookingRepository } from '../../../../src/repositories/implementation/booking.repository';
import { IRevenueDistributionRepository } from '../../../../src/repositories/interfaces/IRevenue.repository';
import { IWalletRepository } from '../../../../src/repositories/interfaces/IWallet.repository';
import { IRevenueDistributionService } from '../../../../src/services/interfaces/IDistribution.service';
import { inject, injectable } from 'tsyringe';
import { IEventRepository } from '../../../../src/repositories/interfaces/IEvent.repository';
import { IChatService } from '../../../../src/services/interfaces/user/chat/IChat.service';
import { ISubscriptionQueryService } from '../../../../src/services/interfaces/user/subscription/ISubscriptionQuery.service';


@injectable()
export class RevenueDistributionService implements IRevenueDistributionService {

  private ADMIN_PERCENTAGE = 10;

  constructor(
    @inject("RevenueDistributionRepository") private revenueDistributionRepository: IRevenueDistributionRepository,
    @inject("WalletRepository") private walletRepository: IWalletRepository,
    @inject("BookingRepository") private bookingRepository: IBookingRepository,
    @inject("EventRepository") private eventRepository: IEventRepository,
    @inject("ChatService") private chatService: IChatService,
    @inject("AdminSubscriptionService") private subscriptionService: ISubscriptionQueryService

  ) { }

  async processFinishedEvents(): Promise<ServiceResponse<{ processed: number; subscriptionsProcessed: { deleted: number; cancelled: number; expired: number } }>> {
    try {
      const finishedEvents = await this.revenueDistributionRepository.findFinishedEventsForDistribution();

      if (finishedEvents.length === 0) {
        return {
          success: true,
          message: 'No finished events to process',
          data: { processed: 0, subscriptionsProcessed: { deleted: 0, cancelled: 0, expired: 0 } }
        };
      }

      // Process subscription cleanup once (outside the loop)
      const [deletedPending, deletedCancelled, expiredUpdated] = await Promise.all([
        this.subscriptionService.deleteAllPendingSubscriptions(),
        this.subscriptionService.deleteAllCancelledSubscriptions(),
        this.subscriptionService.updateExpiredSubscriptions()
      ]);

      let processedCount = 0;
      const eventProcessingPromises = finishedEvents.map(async (event) => {
        try {
          const [revenueResult] = await Promise.all([
            this.distributeEventRevenue(event._id as Schema.Types.ObjectId),
            this.chatService.deleteGroupChatByEventId(event._id as string)
          ]);

          return revenueResult.success;
        } catch (error) {
          console.error(`Failed to process event ${event._id}:`, error);
          return false;
        }
      });

      const results = await Promise.all(eventProcessingPromises);
      processedCount = results.filter(success => success).length;

      return {
        success: true,
        message: `Successfully processed ${processedCount}/${finishedEvents.length} events. Subscriptions: ${deletedPending.deletedCount} pending deleted, ${deletedCancelled.deletedCount} cancelled deleted, ${expiredUpdated.modifiedCount} expired updated`,
        data: {
          processed: processedCount,
          subscriptionsProcessed: {
            deleted: deletedPending.deletedCount,
            cancelled: deletedCancelled.deletedCount,
            expired: expiredUpdated.modifiedCount
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to process finished events: ${(error as Error).message}`
      };
    }
  }

  async distributeEventRevenue(eventId: Schema.Types.ObjectId | string): Promise<ServiceResponse<IRevenueDistribution | null>> {
    try {
      const existingDistribution = await this.revenueDistributionRepository.findDistributionByEventId(eventId);
      if (existingDistribution && existingDistribution.is_distributed) {
        return {
          success: false,
          message: "Revenue for this event has already been distributed"
        };
      }

      const bookings = await this.bookingRepository.findBookingsByEventId(eventId, { paymentStatus: "Completed" });

      if (!bookings || bookings.length === 0) {
        return {
          success: false,
          message: "No completed bookings found for this event"
        };
      }

      let totalRevenue = 0;
      let totalParticipants = 0;

      bookings.forEach(booking => {

        booking.tickets.forEach(ticket => {
          if (ticket.status !== 'Cancelled') {
            totalRevenue += ticket.totalPrice;
            totalParticipants += ticket.quantity;
          }
        });
      });

      // Calculate revenue split
      const adminAmount = ((totalRevenue + 40) * this.ADMIN_PERCENTAGE) / 100;
      const organizerAmount = (totalRevenue + 40) - adminAmount;

      // Get event details for organizer ID
      const eventWithOrganizer = await this.eventRepository.findEventById(eventId);
      if (!eventWithOrganizer) {
        throw new Error("Event not found");
      }

      // Create or update revenue distribution record
      let distribution: IRevenueDistribution;

      if (existingDistribution) {
        const updatedDistribution = await this.revenueDistributionRepository.updateDistribution(eventId, {
          admin_percentage: { $numberDecimal: this.ADMIN_PERCENTAGE.toString() } as any,
          total_revenue: { $numberDecimal: totalRevenue.toString() } as any,
          total_participants: totalParticipants,
          admin_amount: { $numberDecimal: adminAmount.toString() } as any,
          organizer_amount: { $numberDecimal: organizerAmount.toString() } as any,
          distributed_at: new Date(),
          is_distributed: false
        });

        if (!updatedDistribution) {
          throw new Error("Failed to update revenue distribution record");
        }

        distribution = updatedDistribution;
      } else {
        distribution = await this.revenueDistributionRepository.createDistribution({
          event: eventId as any,
          admin_percentage: { $numberDecimal: this.ADMIN_PERCENTAGE.toString() } as any,
          total_revenue: { $numberDecimal: totalRevenue.toString() } as any,
          total_participants: totalParticipants,
          admin_amount: { $numberDecimal: adminAmount.toString() } as any,
          organizer_amount: { $numberDecimal: organizerAmount.toString() } as any,
          is_distributed: false
        });
      }

      const organizerId = eventWithOrganizer.user_id;
      const eventName = eventWithOrganizer.eventTitle;

      const wallet = await this.walletRepository.findWalletById(organizerId);

      if (!wallet) {
        await this.walletRepository.createWallet({
          userId: organizerId as any,
          walletBalance: 0,
          transactions: []
        });
      }
      await this.walletRepository.addTransaction(
        organizerId,
        {
          eventId: eventId.toString(),
          eventName: eventName,
          amount: organizerAmount,
          type: TransactionType.CREDIT,
          description: `Revenue from event: ${eventName}`,
          metadata: {
            eventId: eventId.toString(),
            distributionId: distribution._id,
            totalRevenue: totalRevenue,
            adminPercentage: this.ADMIN_PERCENTAGE
          }
        }
      );

      // Mark as distributed
      const completedDistribution = await this.revenueDistributionRepository.markDistributionCompleted(eventId);

      return {
        success: true,
        message: "Revenue distributed successfully",
        data: completedDistribution
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to distribute revenue: ${(error as Error).message}`
      };
    }
  }

  async getDistributionByEventId(eventId: Schema.Types.ObjectId | string): Promise<ServiceResponse<IRevenueDistribution | null>> {
    try {
      const distribution = await this.revenueDistributionRepository.findDistributionByEventId(eventId);

      return {
        success: true,
        message: distribution ? "Distribution found" : "No distribution found for this event",
        data: distribution
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch distribution: ${(error as Error).message}`
      };
    }
  }

  async getAllCompletedDistributions(): Promise<ServiceResponse<IRevenueDistribution[]>> {
    try {
      const distributions = await this.revenueDistributionRepository.findCompletedDistributions();

      return {
        success: true,
        message: "Successfully fetched all completed distributions",
        data: distributions
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch completed distributions: ${(error as Error).message}`
      };
    }
  }

  async getDistributedRevenue(page: number, limit: number): Promise<ServiceResponse<any>> {
    try {
      const result = await this.revenueDistributionRepository.findDistributedRevenueWithPagination(page, limit);

      return {
        success: true,
        message: "Revenue distribution data fetched successfully",
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch revenue distribution data: ${(error as Error).message}`
      };
    }
  }

  async getRecentDistributedRevenue(limit: number): Promise<ServiceResponse<IRevenueDistribution[]>> {
    try {
      const result = await this.revenueDistributionRepository.findRecentDistributedRevenue(limit);

      return {
        success: true,
        message: "Recent revenue distribution data fetched successfully",
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch recent revenue distribution data: ${(error as Error).message}`
      };
    }
  }

  async getRevenueByEventId(eventId: Schema.Types.ObjectId | string): Promise<ServiceResponse<IRevenueDistribution | null>> {
    try {
      const result = await this.revenueDistributionRepository.findRevenueByEventId(eventId);

      return {
        success: true,
        message: "Revenue for event fetched successfully",
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch revenue for event: ${(error as Error).message}`
      };
    }
  }

  async getEventsByIds(eventIds: (Schema.Types.ObjectId | string)[]): Promise<ServiceResponse<any>> {
    try {
      const events = await this.eventRepository.findEventsByIds(eventIds);

      return {
        success: true,
        message: "Events fetched successfully",
        data: events
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch events: ${(error as Error).message}`
      };
    }
  }
  async getRevenueStats(): Promise<ServiceResponse<any>> {
    try {
      const totalRevenue = await this.revenueDistributionRepository.findTotalRevenue();
      const previousMonthTotalRevenue = await this.revenueDistributionRepository.findTotalRevenueForPreviousMonth();

      const todayRevenue = await this.revenueDistributionRepository.findTodayRevenue();
      const yesterdayRevenue = await this.revenueDistributionRepository.findYesterdayRevenue();

      const currentMonthRevenue = await this.revenueDistributionRepository.findCurrentMonthRevenue();
      const previousMonthRevenue = await this.revenueDistributionRepository.findPreviousMonthRevenue();

      const totalRevenueChange = previousMonthTotalRevenue > 0
        ? ((totalRevenue - previousMonthTotalRevenue) / previousMonthTotalRevenue) * 100
        : 0;

      const todayRevenueChange = yesterdayRevenue > 0
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
        : 0;

      const monthlyRevenueChange = previousMonthRevenue > 0
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
        : 0;

      const stats = {
        totalRevenue: totalRevenue.toFixed(2),
        totalRevenueChange: Number(totalRevenueChange.toFixed(1)),
        todayRevenue: todayRevenue.toFixed(2),
        todayRevenueChange: Number(todayRevenueChange.toFixed(1)),
        monthlyRevenue: currentMonthRevenue.toFixed(2),
        monthlyRevenueChange: Number(monthlyRevenueChange.toFixed(1))
      };

      return {
        success: true,
        message: "Revenue statistics fetched successfully",
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch revenue statistics: ${(error as Error).message}`
      };
    }
  }

  async getRevenueByDateRange(
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number = 10,
    isDistributed: boolean = true
  ): Promise<ServiceResponse<any>> {
    try {
      const result = await this.revenueDistributionRepository.findRevenueByDateRange(
        startDate,
        endDate,
        page,
        limit,
        isDistributed
      );

      return {
        success: true,
        message: "Revenue distribution data fetched successfully",
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch revenue distribution data: ${(error as Error).message}`
      };
    }
  }
}