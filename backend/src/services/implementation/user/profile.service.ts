
import { IUser, ServiceResponse } from '../../../models/interfaces/auth.interface';
import cloudinary from '../../../configs/cloudinary';
import { Readable } from 'stream';
import { CloudinaryUploadResult } from '../../../models/interfaces/profile.interface';
import {  IBookingRepository } from '../../../repositories/booking.repository';
import { IWallet, TransactionType } from '../../../models/interfaces/wallet.interface';
import { Schema } from 'mongoose';
import { inject, injectable } from 'tsyringe';
import { IProfileService } from '../../../../src/services/interfaces/IProfile.service';
import { IUserRepository } from '../../../../src/repositories/interfaces/IUser.repository';
import { IVerificationRepository } from '../../../../src/repositories/interfaces/IVerification.repository';
import { IWalletRepository } from '../../../../src/repositories/interfaces/IWallet.repository';



@injectable()
export class ProfileService implements IProfileService{
  constructor(
    @inject("UserRepository") private userRepository:IUserRepository,
    @inject("BookingRepository") private bookingRepository:IBookingRepository,
    @inject("WalletRepository") private walletRepository:IWalletRepository,
    @inject("VerificationRepository") private verificationRepository:IVerificationRepository,
  ) {}
  async fetchUserById(userId: Schema.Types.ObjectId | string): Promise<ServiceResponse<IUser>> {
    try {
      const user = await this.userRepository.findUserById(userId);

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      return {
        success: true,
        message: "User fetched successfully",
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to fetch user",
      };
    }
  }

  async updateUserDetails(userId: Schema.Types.ObjectId | string, data: Partial<IUser>): Promise<ServiceResponse<IUser>> {
    try {
      const user = await this.userRepository.updateUser(userId, data);

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      return {
        success: true,
        message: "User Updated successfully",
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to update user",
      };
    }
  }

  async verificationRequest(userId:  Schema.Types.ObjectId | string): Promise<any> {
    try {
      const data = {
        user_id: userId,
      }


      const record = await this.verificationRepository.createVerificationRequest(data);

      if (record) {
        return {
          success: true,
          message: "Request successfully sended",
        };
      } else {
        return {
          success: false,
          message: "Request failed",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Request failed",
      };
    }
  }
  async verificationRequestDetails(userId:  Schema.Types.ObjectId | string): Promise<any> {
    try {
      const record = await this.verificationRepository.getVerificationRequest(userId);
      if (record) {
        return {
          success: true,
          message: "Request successfully sended",
          data: record
        };
      } else {
        return {
          success: false,
          message: "Request failed",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Request failed",
      };
    }
  }

  //profile image section

  async uploadImage(buffer: Buffer, folder = 'profiles'): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as CloudinaryUploadResult);
        }
      );



      const readableStream = new Readable({
        read() {
          this.push(buffer);
          this.push(null);
        }
      });



      readableStream.pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }



  //event section
  async getUserBookings(userId:  Schema.Types.ObjectId | string): Promise<any[]> {
    try {
      console.log('controller');

      const bookings = await this.bookingRepository.findByUserId(userId);

      return bookings;
    } catch (error) {
      throw new Error(`Failed to fetch user bookings: ${(error as Error).message}`);
    }
  }


  //wallet section
  async addMoneyToWallet(userId:  Schema.Types.ObjectId | string, amount: number, reference?: string): Promise<ServiceResponse<IWallet>> {
    try {
      if (amount <= 0) {
        return {
          success: false,
          message: "Amount must be greater than zero"
        };
      }

      let wallet = await this.walletRepository.findWalletById(userId);
      if (!wallet) {
        wallet = await this.walletRepository.createWallet({
          userId,
          walletBalance: 0,
          transactions: []
        });
      }

      const updatedWallet = await this.walletRepository.addTransaction(userId, {
        eventName: 'Wallet Top-up',
        eventId: 'wallet_topup',
        amount,
        type: TransactionType.CREDIT,
        description: 'Added money to wallet',
        reference
      });

      if (!updatedWallet) {
        return {
          success: false,
          message: "Failed to add money to wallet"
        };
      }

      return {
        success: true,
        message: "Money added to wallet successfully",
        data: updatedWallet
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || "Failed to add money to wallet"
      };
    }
  }

  async withdrawMoneyFromWallet(userId:  Schema.Types.ObjectId | string, amount: number): Promise<ServiceResponse<IWallet>> {
    try {
      if (amount <= 0) {
        return {
          success: false,
          message: "Amount must be greater than zero"
        };
      }

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

      const updatedWallet = await this.walletRepository.addTransaction(userId, {
        eventName: 'Wallet Withdrawal',
        eventId: 'wallet_withdrawal',
        amount,
        type: TransactionType.WITHDRAWAL,
        description: 'Withdrawn money from wallet'
      });

      if (!updatedWallet) {
        return {
          success: false,
          message: "Failed to withdraw money from wallet"
        };
      }

      return {
        success: true,
        message: "Money withdrawn from wallet successfully",
        data: updatedWallet
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || "Failed to withdraw money from wallet"
      };
    }
  }

  async getWalletDetails(userId:  Schema.Types.ObjectId | string): Promise<ServiceResponse<IWallet>> {
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