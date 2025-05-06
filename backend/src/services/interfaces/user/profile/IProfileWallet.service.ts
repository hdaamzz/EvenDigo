import { Schema } from 'mongoose';
import { ServiceResponse } from '../../../../../src/models/interfaces/auth.interface';
import { IWallet } from '../../../../../src/models/interfaces/wallet.interface';

export interface IProfileWalletService {
  getWalletDetails(userId: Schema.Types.ObjectId | string): Promise<ServiceResponse<IWallet>>;
}
