
import { IUser, ServiceResponse } from '../../../models/interfaces/auth.interface';
import cloudinary from '../../../configs/cloudinary';
import { Readable } from 'stream';
import { CloudinaryUploadResult, ProfileServiceResponse } from '../../../models/interfaces/profile.interface';
import { IWallet, TransactionType } from '../../../models/interfaces/wallet.interface';
import { Schema } from 'mongoose';
import { inject, injectable } from 'tsyringe';
import { IProfileService } from '../../../../src/services/interfaces/IProfile.service';
import { IUserRepository } from '../../../../src/repositories/interfaces/IUser.repository';
import { IVerificationRepository } from '../../../../src/repositories/interfaces/IVerification.repository';
import { IWalletRepository } from '../../../../src/repositories/interfaces/IWallet.repository';
import { IEventRepository } from '../../../../src/repositories/interfaces/IEvent.repository';
import { IBooking } from '../../../../src/models/interfaces/booking.interface';
import { EventDocument } from '../../../../src/models/interfaces/event.interface';
import { IBookingRepository } from '../../../../src/repositories/interfaces/IBooking.repository';



@injectable()
export class ProfileService implements IProfileService{
  constructor(
    @inject("UserRepository") private userRepository:IUserRepository,
    @inject("BookingRepository") private bookingRepository:IBookingRepository,
    @inject("WalletRepository") private walletRepository:IWalletRepository,
    @inject("VerificationRepository") private verificationRepository:IVerificationRepository,
    @inject("EventRepository") private dashboardRespository :IEventRepository,
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

  async getUserEvents(userId:  Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    try {
      const events = await this.dashboardRespository.findEventByUserId(userId);

      return events;
    } catch (error) {
      throw new Error(`Failed to fetch user bookings: ${(error as Error).message}`);
    }
  }

  async getEvent(eventId:  Schema.Types.ObjectId | string): Promise<EventDocument | null> {
    try {
      const events = await this.dashboardRespository.findEventById(eventId);

      return events;
    } catch (error) {
      throw new Error(`Failed to fetch user bookings: ${(error as Error).message}`);
    }
  }


  async getUserBookings(userId:  Schema.Types.ObjectId | string): Promise<IBooking[]> {
    try {
      const bookings = await this.bookingRepository.findBookingByUserId(userId);

      return bookings;
    } catch (error) {
      throw new Error(`Failed to fetch user bookings: ${(error as Error).message}`);
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

  async cancelTicket(
    userId: Schema.Types.ObjectId | string,
    bookingId: string,
    ticketUniqueId: string
  ): Promise<ProfileServiceResponse<IBooking>> {
    try {
      const booking = await this.bookingRepository.findBookingById(bookingId);
      
      if (!booking) {
        return {
          success: false,
          message: "Booking not found"
        };
      }
      
      if (booking.userId.toString() !== userId.toString()) {
        return {
          success: false,
          message: "You are not authorized to cancel this ticket"
        };
      }
      
      const ticketToCancel = booking.tickets.find(ticket => ticket.uniqueId === ticketUniqueId);
      
      if (!ticketToCancel) {
        return {
          success: false,
          message: "Ticket not found in this booking"
        };
      }
      
      if (ticketToCancel.status === 'Cancelled') {
        return {
          success: false,
          message: "This ticket has already been cancelled"
        };
      }
  
      const refundAmount =Math.floor( ticketToCancel.price * ticketToCancel.quantity * 0.9);
      
      console.log("refundAmount",refundAmount,
        "bookingId",bookingId,
        "ticketUniqueId",ticketUniqueId,

      );
      

      const updatedBooking = await this.bookingRepository.updateTicketStatus(
        bookingId,
        ticketUniqueId,
        'Cancelled'
      );
      
      if (!updatedBooking) {
        return {
          success: false,
          message: "Failed to update ticket status"
        };
      }
      
      const eventName ='Event';
      const eventId = booking.eventId.toString();
      let wallet =await this.walletRepository.findWalletById(userId)
      if(!wallet){
        await this.walletRepository.createWallet({
          userId,
          walletBalance: 0,
          transactions: []
        });
      }
      
      const walletUpdate = await this.walletRepository.addTransaction(
        userId,
        {
          eventName,
          eventId,
          amount: refundAmount,
          type: TransactionType.REFUND,
          description: `Refund for cancelled ${ticketToCancel.type} ticket(s)`,
          metadata: {
            bookingId,
            ticketType: ticketToCancel.type,
            quantity: ticketToCancel.quantity,
            originalPrice: ticketToCancel.price * ticketToCancel.quantity,
            cancellationFee: Math.floor(ticketToCancel.price * ticketToCancel.quantity * 0.1)
          }
        }
      );
      
      if (!walletUpdate) {
        console.error('Failed to add refund to wallet for user:', userId);
      }
      
      return {
        success: true,
        message: `Ticket cancelled successfully. ₹${refundAmount.toFixed(2)} has been credited to your wallet.`,
        data: {
          updatedBooking,
          refundAmount
        }
      };
    } catch (error) {
      console.error('Error in cancelTicket service:', error);
      return {
        success: false,
        message: (error as Error).message || "Failed to cancel ticket"
      };
    }
  }
  async updateEvent(eventId: Schema.Types.ObjectId | string, updateData: Partial<EventDocument>): Promise<EventDocument | null> {
    try {
      
      const updatedEvent = await this.dashboardRespository.updateEvent(eventId, updateData);
      return updatedEvent;
    } catch (error) {
      throw new Error(`Failed to update event: ${(error as Error).message}`);
    }
  }
  
  async deleteEvent(eventId: Schema.Types.ObjectId | string): Promise<boolean> {
    try {
      const result = await this.dashboardRespository.deleteEvent(eventId);
      return result;
    } catch (error) {
      throw new Error(`Failed to delete event: ${(error as Error).message}`);
    }
  }
}