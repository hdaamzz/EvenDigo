import { Schema } from 'mongoose';
import { ServiceResponse } from '../../../../../src/models/interfaces/auth.interface';
import { IWallet } from '../../../../../src/models/interfaces/wallet.interface';
import { IWalletRepository } from '../../../../../src/repositories/interfaces/IWallet.repository';
import { IProfileWalletService } from '../../../../../src/services/interfaces/user/profile/IProfileWallet.service';
import { inject, injectable } from 'tsyringe';


@injectable()
export class ProfileWalletService implements IProfileWalletService {
  constructor(
    @inject("WalletRepository") private walletRepository: IWalletRepository,
  ) {}

  async getWalletDetails(userId: Schema.Types.ObjectId | string): Promise<ServiceResponse<IWallet>> {
    try {
      const wallet = await this.walletRepository.getWalletWithTransactions(userId);
      
      if (!wallet) {
        const newWallet = await this.walletRepository.createWallet({
          userId,
          walletBalance: 0,
          transactions: []
        });
        
        return {
          success: true,
          message: "New wallet created",
          data: newWallet
        };
      }

      return {
        success: true,
        message: "Wallet details fetched successfully",
        data: wallet
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || "Failed to get wallet details"
      };
    }
  }
}