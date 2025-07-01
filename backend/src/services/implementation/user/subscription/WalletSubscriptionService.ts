import { SubscriptionPayload } from '../../../../services/interfaces/user/subscription/ISubscriptionQuery.service';
import { BadRequestException, ConflictException, NotFoundException } from '../../../../error/error-handlers';
import { TransactionType } from '../../../../models/interfaces/wallet.interface';
import { ISubscription, SubscriptionStatus, SubscriptionType } from '../../../../models/SubscriptionModal';
import { ISubscriptionRepository } from '../../../../repositories/interfaces/ISubscription.repository';
import { IWalletRepository } from '../../../../repositories/interfaces/IWallet.repository';
import { IWalletSubscriptionService } from '../../../../services/interfaces/user/subscription/IWalletSubscription.service';
import { inject, injectable } from 'tsyringe';
import { generateRandomId } from '../../../../utils/helpers';


@injectable()
export class WalletSubscriptionService implements IWalletSubscriptionService {
  constructor(
    @inject("SubscriptionRepository") private subscriptionRepository: ISubscriptionRepository,
    @inject("WalletRepository") private walletRepository: IWalletRepository
  ) {}

  async processSubscription(userId: string, payload: SubscriptionPayload): Promise<ISubscription> {
    try {
      const existingSubscription = await this.subscriptionRepository.findActiveSubscriptionByUserId(userId);
      if (existingSubscription) {
        throw new ConflictException('You already has an active subscription');
      }

      const wallet = await this.walletRepository.findWalletById(userId);
      if (!wallet) {
        throw new NotFoundException('Wallet not found for this user');
      }
      
      if (wallet.walletBalance < payload.amount) {
        throw new BadRequestException('Insufficient wallet balance for subscription');
      }

      const subscriptionId = this.generateSubscriptionId();
      const sessionId=generateRandomId()
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const subscription = await this.subscriptionRepository.createSubscription({
        userId,
        subscriptionId,
        type: payload.planType === 'premium' ? SubscriptionType.PREMIUM : SubscriptionType.STANDARD,
        amount: payload.amount,
        status: SubscriptionStatus.ACTIVE,
        startDate,
        endDate,
        isActive: true,
        paymentMethod: 'wallet',
        stripeSessionId:sessionId
      });

      await this.recordWalletTransaction(userId, payload.amount, subscriptionId, payload.planType);

      return subscription;
    } catch (error) {
      if (error instanceof BadRequestException || 
          error instanceof ConflictException || 
          error instanceof NotFoundException) {
        throw error;
      }
      
      throw new Error(`Wallet subscription failed: ${(error as Error).message}`);
    }
  }

  private async recordWalletTransaction(
    userId: string, 
    amount: number, 
    subscriptionId: string, 
    planType: string
  ): Promise<void> {
    await this.walletRepository.addTransaction(
      userId,
      {
        amount: amount,
        type: TransactionType.DEBIT,
        description: `Payment for ${planType} subscription #${subscriptionId}`,
        metadata: {
          subscriptionId,
          planType
        }
      }
    );
  }

  private generateSubscriptionId(): string {
    return `SUB${Date.now()}${Math.floor(Math.random() * 10000)}`;
  }
}