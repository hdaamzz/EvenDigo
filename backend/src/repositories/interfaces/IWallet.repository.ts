import { Schema } from 'mongoose';
import { IWallet, ITransaction } from '../../models/interfaces/wallet.interface';

export interface IWalletRepository {
  findWalletById(userId: Schema.Types.ObjectId | string): Promise<IWallet | null>;
  createWallet(walletData: Partial<IWallet>): Promise<IWallet>;
  updateWallet(userId: string, updateData: Partial<IWallet>): Promise<IWallet | null>;
  addTransaction(
    userId: Schema.Types.ObjectId | string,
    transactionData: Partial<ITransaction>
  ): Promise<IWallet | null>;
  getWalletWithTransactions(userId: Schema.Types.ObjectId | string, limit?: number): Promise<IWallet | null>;
}