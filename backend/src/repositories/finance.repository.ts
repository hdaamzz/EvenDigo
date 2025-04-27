import { Model } from 'mongoose';
import { inject, injectable } from 'tsyringe';
import { IFinanceRepository } from './interfaces/IFinance.repository';
import { IBooking } from '../models/interfaces/booking.interface';

@injectable()
export class FinanceRepository implements IFinanceRepository {
  constructor(
    @inject("BookingModel") private bookingModel: Model<IBooking>
  ) {}

  async findRevenueTransactions(page: number, limit: number, search: string = ''): Promise<any> {
    try {
      // Build search query
      const searchQuery: any = { 
        paymentStatus: "Completed" // Only include completed payments
      };
      
      if (search) {
        // Add search conditions for event name, organizer name, etc.
        searchQuery.$or = [
          { 'eventId.eventTitle': { $regex: search, $options: 'i' } },
          { 'eventId.user_id.name': { $regex: search, $options: 'i' } },
          { 'userId.name': { $regex: search, $options: 'i' } }
        ];
      }
      
      // Calculate skip value for pagination
      const skip = (page - 1) * limit;
      
      // Get total count for pagination
      const totalItems = await this.bookingModel.countDocuments(searchQuery);
      
      // Fetch data with pagination and populate related fields
      const bookings = await this.bookingModel.find(searchQuery)
        .populate('eventId', 'eventTitle user_id')
        .populate('eventId.user_id', 'name')
        .populate('userId', 'name')
        .sort({ createdAt: -1 }) // Most recent first
        .skip(skip)
        .limit(limit);
      
      // Calculate total pages
      const totalPages = Math.ceil(totalItems / limit);
      
      return {
        data: bookings,
        totalItems,
        currentPage: page,
        totalPages
      };
    } catch (error) {
      throw new Error(`Error finding revenue transactions: ${(error as Error).message}`);
    }
  }

  async findTotalRevenue(): Promise<number> {
    try {
      const result = await this.bookingModel.aggregate([
        { $match: { paymentStatus: "Completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]);
      
      return result.length > 0 ? result[0].total : 0;
    } catch (error) {
      throw new Error(`Error calculating total revenue: ${(error as Error).message}`);
    }
  }

  async findTotalRevenueForPreviousMonth(): Promise<number> {
    try {
      const now = new Date();
      const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      const result = await this.bookingModel.aggregate([
        { 
          $match: { 
            paymentStatus: "Completed",
            createdAt: { 
              $gte: firstDayOfPreviousMonth,
              $lt: firstDayOfCurrentMonth
            }
          } 
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]);
      
      return result.length > 0 ? result[0].total : 0;
    } catch (error) {
      throw new Error(`Error calculating previous month revenue: ${(error as Error).message}`);
    }
  }

  async findTodayRevenue(): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const result = await this.bookingModel.aggregate([
        { 
          $match: { 
            paymentStatus: "Completed",
            createdAt: { 
              $gte: today,
              $lt: tomorrow
            }
          } 
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]);
      
      return result.length > 0 ? result[0].total : 0;
    } catch (error) {
      throw new Error(`Error calculating today's revenue: ${(error as Error).message}`);
    }
  }

  async findYesterdayRevenue(): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const result = await this.bookingModel.aggregate([
        { 
          $match: { 
            paymentStatus: "Completed",
            createdAt: { 
              $gte: yesterday,
              $lt: today
            }
          } 
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]);
      
      return result.length > 0 ? result[0].total : 0;
    } catch (error) {
      throw new Error(`Error calculating yesterday's revenue: ${(error as Error).message}`);
    }
  }

  async findCurrentMonthRevenue(): Promise<number> {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      
      const result = await this.bookingModel.aggregate([
        { 
          $match: { 
            paymentStatus: "Completed",
            createdAt: { 
              $gte: firstDayOfMonth,
              $lt: firstDayOfNextMonth
            }
          } 
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]);
      
      return result.length > 0 ? result[0].total : 0;
    } catch (error) {
      throw new Error(`Error calculating current month revenue: ${(error as Error).message}`);
    }
  }

  async findPreviousMonthRevenue(): Promise<number> {
    try {
      const now = new Date();
      const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      const result = await this.bookingModel.aggregate([
        { 
          $match: { 
            paymentStatus: "Completed",
            createdAt: { 
              $gte: firstDayOfPreviousMonth,
              $lt: firstDayOfCurrentMonth
            }
          } 
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]);
      
      return result.length > 0 ? result[0].total : 0;
    } catch (error) {
      throw new Error(`Error calculating previous month revenue: ${(error as Error).message}`);
    }
  }

  async findRevenueByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
    let query = {
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };
    
    const results = await this.bookingModel.find(query)
      .populate('eventId')
      .populate('userId')
      .sort({ createdAt: -1 });
      
    return results;
  }
}