import { Schema } from 'mongoose';
import { BadRequestException, ForbiddenException, NotFoundException } from '../../../../error/error-handlers';
import { IBooking } from '../../../../models/interfaces/booking.interface';
import { ProfileServiceResponse } from '../../../../models/interfaces/profile.interface';
import { TransactionType } from '../../../../models/interfaces/wallet.interface';
import { IBookingRepository } from '../../../../repositories/interfaces/IBooking.repository';
import { IWalletRepository } from '../../../../repositories/interfaces/IWallet.repository';
import { IEventRepository } from '../../../../repositories/interfaces/IEvent.repository';
import { IProfileBookingService } from '../../../../services/interfaces/user/profile/IProfileBooking.service';
import { inject, injectable } from 'tsyringe';


@injectable()
export class ProfileBookingService implements IProfileBookingService {
  constructor(
    @inject("BookingRepository") private bookingRepository: IBookingRepository,
    @inject("WalletRepository") private walletRepository: IWalletRepository,
    @inject("EventRepository") private eventRepository: IEventRepository,
  ) { }

  async getUserBookings(
    userId: Schema.Types.ObjectId | string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ bookings: IBooking[], totalCount: number, hasMore: boolean }> {
    try {
      const skip = (page - 1) * limit;

      const [bookings, totalCount] = await Promise.all([
        this.bookingRepository.findUpcomingEventBookingByUserId(userId, skip, limit),
        this.bookingRepository.countUpcomingEventBookingByUserId(userId)
      ]);

      const hasMore = skip + bookings.length < totalCount;

      return {
        bookings,
        totalCount,
        hasMore
      };
    } catch (error) {
      throw new Error(`Failed to fetch user bookings: ${(error as Error).message}`);
    }
  }

  async cancelTicket(
    userId: Schema.Types.ObjectId | string,
    bookingId: string,
    ticketUniqueId: string
  ): Promise<ProfileServiceResponse<IBooking>> {
    try {
      const booking = await this.bookingRepository.findBookingById(bookingId);

      if (!booking) {
        throw new NotFoundException("Booking not found");
      }

      if (booking.userId.toString() !== userId.toString()) {
        throw new ForbiddenException("You are not authorized to cancel this ticket");
      }

      const ticketToCancel = booking.tickets.find(ticket => ticket.uniqueId === ticketUniqueId);

      if (!ticketToCancel) {
        throw new NotFoundException("Ticket not found in this booking");
      }

      if (ticketToCancel.status === 'Cancelled') {
        throw new BadRequestException("This ticket has already been cancelled");
      }

      const refundAmount = Math.floor(ticketToCancel.price * ticketToCancel.quantity * 0.9);

      const updatedBooking = await this.bookingRepository.updateTicketStatus(
        bookingId,
        ticketUniqueId,
        'Cancelled'
      );

      if (!updatedBooking) {
        throw new BadRequestException("Failed to update ticket status");
      }

      await this.restoreTicketQuantity(
        booking.eventId.toString(),
        ticketToCancel.type,
        ticketToCancel.quantity
      );

      const eventName = 'Event';
      const eventId = booking.eventId.toString();

      let wallet = await this.walletRepository.findWalletById(userId);

      if (!wallet) {
        await this.walletRepository.createWallet({
          userId,
          walletBalance: 0,
          transactions: []
        });
      }

      const walletUpdate = await this.walletRepository.addTransaction(
        userId,
        {
          eventName,
          eventId,
          amount: refundAmount,
          type: TransactionType.REFUND,
          description: `Refund for cancelled ${ticketToCancel.type} ticket(s)`,
          metadata: {
            bookingId,
            ticketType: ticketToCancel.type,
            quantity: ticketToCancel.quantity,
            originalPrice: ticketToCancel.price * ticketToCancel.quantity,
            cancellationFee: Math.floor(ticketToCancel.price * ticketToCancel.quantity * 0.1),
            restoredQuantity: ticketToCancel.quantity
          }
        }
      );

      if (!walletUpdate) {
        console.error('Failed to add refund to wallet for user:', userId);
      }

      return {
        success: true,
        message: `Ticket cancelled successfully. ₹${refundAmount.toFixed(2)} has been credited to your wallet and ${ticketToCancel.quantity} ${ticketToCancel.type} ticket(s) have been made available again.`,
        data: {
          updatedBooking,
          refundAmount,
          restoredQuantity: ticketToCancel.quantity,
          ticketType: ticketToCancel.type
        }
      };
    } catch (error) {
      console.error('Error in cancelTicket service:', error);

      if (error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException) {
        return {
          success: false,
          message: error.message
        };
      }

      return {
        success: false,
        message: (error as Error).message || "Failed to cancel ticket"
      };
    }
  }


  private async restoreTicketQuantity(
    eventId: string,
    ticketType: string,
    quantity: number
  ): Promise<void> {
    try {
      const ticketsToRestore = {
        [ticketType]: -quantity
      };

      await this.eventRepository.updateTicketQuantities(eventId, ticketsToRestore);

    } catch (error) {
      console.error(`Failed to restore ticket quantity for event ${eventId}:`, error);

    }
  }
}