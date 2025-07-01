import { Schema } from "mongoose";
import { IWallet, TransactionType } from "../../models/interfaces/wallet.interface";
import { WalletModel } from "../../models/WalletModel";
import { v4 as uuidv4 } from 'uuid';
import { IWalletRepository } from "../interfaces/IWallet.repository";
import { injectable } from "tsyringe";

@injectable()
export class WalletRepository implements IWalletRepository{
    async findWalletById(userId: Schema.Types.ObjectId | string): Promise<IWallet | null> {
        return WalletModel.findOne({ userId }).exec();
    }

    async createWallet(walletData: Partial<IWallet>): Promise<IWallet> {
        const wallet = new WalletModel(walletData);
        return wallet.save();
    }

    async updateWallet(userId: Schema.Types.ObjectId | string, updateData: Partial<IWallet>): Promise<IWallet | null> {
        return WalletModel.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { new: true }
        ).exec();
    }

    async addTransaction(
        userId: Schema.Types.ObjectId | string,
        transactionData: {
            eventName: string;
            eventId: string;
            amount: number;
            type: TransactionType;
            description?: string;
            reference?: string;
            metadata?: Record<string, any>;
        }
    ): Promise<IWallet | null> {
        const wallet = await this.findWalletById(userId);
        if (!wallet) return null;

        const newBalance = transactionData.type === TransactionType.CREDIT || transactionData.type === TransactionType.REFUND
            ? wallet.walletBalance + transactionData.amount
            : wallet.walletBalance - transactionData.amount;

        const transaction = {
            ...transactionData,
            date: new Date(),
            transactionId: uuidv4(),
            balance: newBalance,
            status: 'completed'
        };

        return WalletModel.findOneAndUpdate(
            { userId },
            {
                $set: { walletBalance: newBalance },
                $push: { transactions: transaction }
            },
            { new: true }
        ).exec();
    }

    async getWalletWithTransactions(userId: Schema.Types.ObjectId | string, limit = 10): Promise<IWallet | null> {
        return WalletModel.findOne({ userId })
            .select({
                transactions: { $slice: limit },
                walletBalance: 1,
                userId: 1
            })
            .sort({ 'transactions.date': -1 })
            .exec();
    }

    
}