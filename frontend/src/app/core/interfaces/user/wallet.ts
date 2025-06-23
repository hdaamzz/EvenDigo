export interface Transaction {
  date: Date;
  eventName: string;
  eventId: string;
  transactionId: string;
  amount: number;
  type: 'credit' | 'debit' | 'refund' | 'withdrawal';
  balance: number;
  status?: 'pending' | 'completed' | 'failed';
  description?: string;
  metadata?: any;
}

export interface TransactionTypeStyle {
  [key: string]: string;
}