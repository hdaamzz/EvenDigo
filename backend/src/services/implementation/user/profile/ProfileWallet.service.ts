// profileWallet.service.ts
import { Schema, Types } from 'mongoose';
import { ServiceResponse } from '../../../../models/interfaces/auth.interface';
import { IWallet, TransactionType } from '../../../../models/interfaces/wallet.interface';
import { IWalletRepository } from '../../../../repositories/interfaces/IWallet.repository';
import { IProfileWalletService } from '../../../../services/interfaces/user/profile/IProfileWallet.service';
import { inject, injectable } from 'tsyringe';
import { StripeService } from '../../../../utils/stripe.service';

@injectable()
export class ProfileWalletService implements IProfileWalletService {
  constructor(
    @inject("WalletRepository") private walletRepository: IWalletRepository,
    @inject("StripeService") private stripeService: StripeService, 
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

  async addMoney(userId: Schema.Types.ObjectId | string, amount: number, reference?: string): Promise<ServiceResponse<any>> {
    try {
      const paymentIntent = await this.stripeService.createPaymentIntent(amount, 'inr');
      
      return {
        success: true,
        message: "Payment intent created successfully",
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id
        }
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || "Failed to create payment intent"
      };
    }
  }

  async withdrawMoney(userId: Schema.Types.ObjectId | string, amount: number, userEmail: string): Promise<ServiceResponse<any>> {
    try {
      const wallet = await this.walletRepository.findWalletById(userId);
      
      if (!wallet) {
        return {
          success: false,
          message: "Wallet not found"
        };
      }

      if (wallet.walletBalance < amount) {
        return {
          success: false,
          message: "Insufficient balance"
        };
      }

      const transfer = await this.stripeService.createPayout(amount, userEmail);
      
      if (!transfer.success) {
        return {
          success: false,
          message: transfer.message || "Failed to process withdrawal"
        };
      }

      const updatedWallet = await this.walletRepository.addTransaction(userId, {
        eventId: new Types.ObjectId().toString(),
        amount: amount,
        type: TransactionType.WITHDRAWAL,
        description: `Withdrawal of ₹${amount.toLocaleString('en-IN')}`,
        reference: transfer.data.payoutId,
        metadata: {
          stripePayoutId: transfer.data.payoutId,
          method: 'stripe_transfer'
        }
      });

      return {
        success: true,
        message: "Withdrawal processed successfully",
        data: {
          transactionId: updatedWallet?.transactions[updatedWallet.transactions.length - 1]?.transactionId,
          newBalance: updatedWallet?.walletBalance,
          payoutId: transfer.data.payoutId
        }
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || "Failed to process withdrawal"
      };
    }
  }
}
