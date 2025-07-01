import { Schema } from 'mongoose';
import { ServiceResponse } from '../../../../models/interfaces/auth.interface';
import { IWallet } from '../../../../models/interfaces/wallet.interface';

export interface IProfileWalletService {
  getWalletDetails(userId: Schema.Types.ObjectId | string): Promise<ServiceResponse<IWallet>>;
}
