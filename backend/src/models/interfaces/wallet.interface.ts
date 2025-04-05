import { Document, Schema } from 'mongoose';

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  REFUND = 'refund',
  WITHDRAWAL = 'withdrawal'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface ITransaction {
  date: Date;
  eventName: string;
  eventId:  Schema.Types.ObjectId | string;
  transactionId: string;
  amount: number;
  type: TransactionType;
  balance: number;
  status: TransactionStatus;
  description?: string;
  reference?: string;
  metadata?: Record<string, any>; 
}

export interface IWallet extends Document {
  userId:  Schema.Types.ObjectId | string;
  walletBalance: number;
  transactions: ITransaction[];
  createdAt: Date;
  updatedAt: Date;
}