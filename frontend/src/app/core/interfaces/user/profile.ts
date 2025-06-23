import { AuthState } from "../../models/userModel";

export interface Transaction {
  date: string;
  eventDetails: string;
  transactionId: string;
  amount: number;
  balance: number;
}

export interface WalletDetails {
  balance: number;
  transactions: Transaction[];
}
export interface AppState {
  auth: AuthState;
}
