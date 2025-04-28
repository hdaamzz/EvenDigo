import { Model } from 'mongoose';
import { inject, injectable } from 'tsyringe';
import { IFinanceRepository } from './interfaces/IFinance.repository';
import { IBooking } from '../models/interfaces/booking.interface';
import { IWallet, TransactionType } from '../../src/models/interfaces/wallet.interface';

@injectable()
export class FinanceRepository implements IFinanceRepository {
  constructor(
    @inject("BookingModel") private bookingModel: Model<IBooking>,
    @inject("WalletModel") private walletModel: Model<IWallet>

  ) { }

  async findRevenueTransactions(page: number, limit: number, search: string = ''): Promise<any> {
    try {
      const searchQuery: any = {
        paymentStatus: "Completed"
      };

      if (search) {
        searchQuery.$or = [
          { 'eventId.eventTitle': { $regex: search, $options: 'i' } },
          { 'eventId.user_id.name': { $regex: search, $options: 'i' } },
          { 'userId.name': { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;

      const totalItems = await this.bookingModel.countDocuments(searchQuery);

      const bookings = await this.bookingModel.find(searchQuery)
        .populate('eventId', 'eventTitle user_id')
        .populate('eventId.user_id', 'name')
        .populate('userId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

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
  async findTransactionsByDateRange(
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number,
    search: string = ''
  ): Promise<any> {
    try {
      const searchQuery: any = {
        paymentStatus: "Completed",
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      };

      if (search) {
        searchQuery.$or = [
          { 'eventId.eventTitle': { $regex: search, $options: 'i' } },
          { 'eventId.user_id.name': { $regex: search, $options: 'i' } },
          { 'userId.name': { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;

      const totalItems = await this.bookingModel.countDocuments(searchQuery);

      const bookings = await this.bookingModel.find(searchQuery)
        .populate('eventId', 'eventTitle user_id')
        .populate('eventId.user_id', 'name')
        .populate('userId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalPages = Math.ceil(totalItems / limit);

      return {
        data: bookings,
        totalItems,
        currentPage: page,
        totalPages
      };
    } catch (error) {
      throw new Error(`Error finding revenue transactions by date range: ${(error as Error).message}`);
    }
  }

  async findRefundTransactions(page: number, limit: number, search: string = ''): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const wallets = await this.walletModel.find({
        'transactions.type': TransactionType.REFUND
      });
      
      const allRefunds: any[] = [];
      
      wallets.forEach(wallet => {
        const refunds = wallet.transactions
          .filter(t => t.type === TransactionType.REFUND)
          .map(refund => {
            return {
              transactionId: refund.transactionId,
              date: refund.date,
              description: refund.description,
              amount: refund.amount,
              type: refund.type,
              status: refund.status,
              metadata: refund.metadata || {},
              userId: wallet.userId,
            };
          });
        
        allRefunds.push(...refunds);
      });
      
      let filteredRefunds = allRefunds;
      if (search) {
        filteredRefunds = allRefunds.filter(refund => 
          refund.transactionId?.includes(search) || 
          (refund.metadata?.bookingId && refund.metadata.bookingId.includes(search))
        );
      }
      
      filteredRefunds.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const paginatedRefunds = filteredRefunds.slice(skip, skip + limit);
      
      return {
        data: paginatedRefunds,
        totalItems: filteredRefunds.length,
        currentPage: page,
        totalPages: Math.ceil(filteredRefunds.length / limit)
      };
    } catch (error) {
      throw new Error(`Error finding refund transactions: ${(error as Error).message}`);
    }
  }
  async findRefundByTransactionId(transactionId: string): Promise<any> {
    try {
      const wallet = await this.walletModel.findOne({
        'transactions.transactionId': transactionId
      });
  
      if (!wallet) {
        throw new Error("Refund transaction not found");
      }
  
      const transaction = wallet.transactions.find(t => 
        t.transactionId === transactionId && t.type === TransactionType.REFUND
      );
  
      if (!transaction) {
        throw new Error("Refund transaction not found");
      }
  
      return {
        ...transaction,
        userId: wallet.userId
      };
    } catch (error) {
      throw new Error(`Error finding refund details: ${(error as Error).message}`);
    }
  }
  
  async findRefundsByDateRange(
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number,
    search: string = ''
  ): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const wallets = await this.walletModel.find({
        'transactions.type': TransactionType.REFUND
      });
      
      const allRefunds: any[] = [];
      
      wallets.forEach(wallet => {
        const refunds = wallet.transactions
          .filter(t => 
            t.type === TransactionType.REFUND && 
            new Date(t.date) >= startDate && 
            new Date(t.date) <= endDate
          )
          .map(refund => {
            return {
              transactionId: refund.transactionId,
              date: refund.date,
              description: refund.description,
              amount: refund.amount,
              type: refund.type,
              status: refund.status,
              metadata: refund.metadata || {},
              userId: wallet.userId,
            };
          });
        
        allRefunds.push(...refunds);
      });
      
      let filteredRefunds = allRefunds;
      if (search) {
        filteredRefunds = allRefunds.filter(refund => 
          refund.transactionId?.includes(search) || 
          (refund.metadata?.bookingId && refund.metadata.bookingId.includes(search))
        );
      }
      
      filteredRefunds.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const paginatedRefunds = filteredRefunds.slice(skip, skip + limit);
      
      return {
        data: paginatedRefunds,
        totalItems: filteredRefunds.length,
        currentPage: page,
        totalPages: Math.ceil(filteredRefunds.length / limit)
      };
    } catch (error) {
      throw new Error(`Error finding refunds by date range: ${(error as Error).message}`);
    }
  }
}