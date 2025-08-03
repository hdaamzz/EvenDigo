import { inject, injectable } from 'tsyringe';
import { Schema } from 'mongoose';
import { IEventRepository } from '../../../../repositories/interfaces/IEvent.repository';
import { IBookingRepository } from '../../../../repositories/interfaces/IBooking.repository';
import { IRevenueDistributionRepository } from '../../../../repositories/interfaces/IRevenue.repository';
import { ForbiddenException, NotFoundException } from '../../../../error/error-handlers';
import { EventAnalytics, IAnalyticsService } from '../../../interfaces/user/analytics/IAnalytics.service';

@injectable()
export class AnalyticsService implements IAnalyticsService {
  constructor(
    @inject("EventRepository") private eventRepository: IEventRepository,
    @inject("BookingRepository") private bookingRepository: IBookingRepository,
    @inject("RevenueDistributionRepository") private revenueDistributionRepository: IRevenueDistributionRepository
  
) {}

  async getEventAnalytics(eventId: Schema.Types.ObjectId | string, userId: Schema.Types.ObjectId | string): Promise<EventAnalytics> {
    const event = await this.eventRepository.findEventByIdWithoutPopulateUser(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    console.log(event.user_id.toString() , userId.toString());
    
    if (event.user_id.toString() !== userId.toString()) {
      throw new ForbiddenException('Not authorized to view analytics for this event');
    }

    const bookings = await this.bookingRepository.findBookingsByEventId(eventId, { paymentStatus: 'Completed' });

    const totalParticipants = bookings.reduce((sum, booking) => {
      return sum + booking.tickets.reduce((ticketSum, ticket) => ticketSum + ticket.quantity, 0);
    }, 0);

    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

    const allBookings = await this.bookingRepository.findBookingsByEventId(eventId, { paymentStatus: 'Completed' });
    const bookingStats = {
      totalBookings: allBookings.length,
      successfulBookings: allBookings.filter(b => b.paymentStatus === 'Completed').length,
      cancelledBookings: allBookings.filter(b => b.paymentStatus === 'Cancelled' || b.paymentStatus === 'Failed').length
    };

    const ticketBreakdown = event.tickets.map(eventTicket => {
      const soldTickets = bookings.reduce((sum, booking) => {
        const matchingTickets = booking.tickets.filter(t => t.type === eventTicket.type);
        return sum + matchingTickets.reduce((ticketSum, ticket) => ticketSum + ticket.quantity, 0);
      }, 0);

      const revenue = bookings.reduce((sum, booking) => {
        const matchingTickets = booking.tickets.filter(t => t.type === eventTicket.type);
        return sum + matchingTickets.reduce((ticketSum, ticket) => ticketSum + ticket.totalPrice, 0);
      }, 0);

      return {
        type: eventTicket.type,
        soldTickets,
        totalTickets: eventTicket.quantity + soldTickets, 
        revenue,
        price: eventTicket.price
      };
    });

    const paymentMethodsMap = new Map();
    bookings.forEach(booking => {
      const method = booking.paymentType || 'Unknown';
      if (paymentMethodsMap.has(method)) {
        const existing = paymentMethodsMap.get(method);
        paymentMethodsMap.set(method, {
          count: existing.count + 1,
          amount: existing.amount + booking.totalAmount
        });
      } else {
        paymentMethodsMap.set(method, {
          count: 1,
          amount: booking.totalAmount
        });
      }
    });

    const paymentMethods = Array.from(paymentMethodsMap.entries()).map(([method, data]) => ({
      method,
      count: data.count,
      amount: data.amount
    }));

    const revenueDistribution = await this.revenueDistributionRepository.findDistributionByEventId(eventId);

    let organizerRevenue = totalRevenue;
    let adminRevenue = 0;
    let adminPercentage = 0;
    let isDistributed = false;
    let distributedAt = undefined;

    if (revenueDistribution) {
      organizerRevenue = parseFloat(revenueDistribution.organizer_amount.toString());
      adminRevenue = parseFloat(revenueDistribution.admin_amount.toString());
      adminPercentage = parseFloat(revenueDistribution.admin_percentage.toString());
      isDistributed = revenueDistribution.is_distributed;
      distributedAt = revenueDistribution.distributed_at;
    }

        const participantGrowth = bookings
        .filter(booking => booking.createdAt !== undefined)
        .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime())
        .reduce((acc, booking) => {
        const date = new Date(booking.createdAt!).toISOString().split('T')[0];
        const existingEntry = acc.find(entry => entry.date === date);
        const participantsInBooking = booking.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
        
        if (existingEntry) {
            existingEntry.count += participantsInBooking;
        } else {
            acc.push({ date, count: participantsInBooking });
        }
        return acc;
        }, [] as Array<{ date: string; count: number }>);

    return {
      eventId: event._id as unknown as string,
      eventTitle: event.eventTitle,
      eventType: event.eventType,
      totalParticipants,
      totalRevenue,
      organizerRevenue,
      adminRevenue,
      adminPercentage,
      ticketBreakdown,
      bookingStats,
      paymentMethods,
      participantGrowth,
      isDistributed,
      distributedAt
    };
  }
}