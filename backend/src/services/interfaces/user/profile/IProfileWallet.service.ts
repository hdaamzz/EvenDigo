import { Schema } from 'mongoose';
import { ServiceResponse } from '../../../../models/interfaces/auth.interface';
import { IWallet } from '../../../../models/interfaces/wallet.interface';

export interface IProfileWalletService {
  getWalletDetails(userId: Schema.Types.ObjectId | string): Promise<ServiceResponse<IWallet>>;
  addMoney(userId: Schema.Types.ObjectId | string, amount: number, reference?: string): Promise<ServiceResponse<any>>;
  withdrawMoney(userId: Schema.Types.ObjectId | string, amount: number, userEmail: string): Promise<ServiceResponse<any>>;
}
