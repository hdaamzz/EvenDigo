import { Document, Schema, model } from 'mongoose';
import { IWallet, TransactionType, TransactionStatus } from './interfaces/wallet.interface';

const transactionSchema = new Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event'
   },
  transactionId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: Object.values(TransactionType),
    required: true
  },
  balance: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(TransactionStatus),
    default: TransactionStatus.COMPLETED
  },
  description: {
    type: String
  },
  reference: {
    type: String
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, { _id: false });

const walletSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  walletBalance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  transactions: {
    type: [transactionSchema],
    default: []
  }
}, {
  timestamps: true,
});

export const WalletModel = model<IWallet & Document>('Wallet', walletSchema);