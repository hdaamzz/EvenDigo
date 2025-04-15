

  export interface WalletTransactionMetadata {
    bookingId: string;
    cancellationFee: number;
    originalPrice: number;
    quantity: number;
    ticketType: string;
  }
  export interface WalletTransaction {
    amount: number;
    balance: number;
    date: string; 
    description: string;
    eventId: string;
    metadata: WalletTransactionMetadata;
    status?: 'pending' | 'completed' | 'failed'; 
    transactionId: string;
    type: 'credit' | 'debit' | 'refund' | 'withdrawal';
  }

  export interface IWallet {
    transactions: WalletTransaction[];
    userId: string;
    walletBalance: number;
    _id: string;
  }

  export interface WalletDetailsResponse{
    success:boolean;
    message:string
    data:IWallet
  }

