import { Request, Response } from 'express';
import { IUser, ServiceResponse } from '../../../models/interfaces/auth.interface';
import { FileRequest } from '../../../models/interfaces/profile.interface';
import { uploadToCloudinary } from '../../../utils/helpers';
import { inject, injectable } from 'tsyringe';
import { IProfileService } from '../../../../src/services/interfaces/IProfile.service';


@injectable()
export class ProfileController {
  constructor(
    @inject("ProfileService")   private profileService: IProfileService,
  ) {}

  async fetchUserById(req: Request, res: Response): Promise<void> {
    const { userId } = req.body;

    const response: ServiceResponse<IUser> = await this.profileService.fetchUserById(userId);
    if (response.success) {
      res.status(200).json(response.data);
    } else {
      res.status(500).json(response);
    }
  }

  async updateUserDetails(req: Request, res: Response): Promise<void> {
    const { userId, name, phone, dateOfBirth, location, bio, gender } = req.body
    const data = { name, phone, dateOfBirth, location, bio, gender }

    const response: ServiceResponse<IUser> = await this.profileService.updateUserDetails(userId, data);
    if (response.success) {
      res.status(200).json(response.data);
    } else {
      res.status(500).json(response);
    }

  }

  async sendVerificationRequest(req: Request, res: Response): Promise<void> {
    const { id } = req.body;
    const response = await this.profileService.verificationRequest(id);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  }
  async verificationRequestDetails(req: Request, res: Response): Promise<void> {
    const id = req.params.id
    const response = await this.profileService.verificationRequestDetails(id);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  }

  async uploadProfileImage(req: FileRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
        return;
      }
  
     
      const result = await uploadToCloudinary(req.file.path);
      
      const publicId = result.public_id;
      if (req.user?._id) {        
        await this.profileService.updateUserDetails(req.user?._id, {
          profileImg: result.secure_url,
          profileImgPublicId: publicId
        });
      }
  
      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        imageUrl: result.secure_url,
        publicId: publicId
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload image'
      });
    }
  }

  async getUserEvents(req: Request, res: Response): Promise<void> {
    const userId = req.user._id.toString();
    try {
      const bookings = await this.profileService.getUserBookings(userId);
      res.status(200).json({ success: true, data: bookings });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  async getUserWallet(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user._id.toString();
      const response = await this.profileService.getWalletDetails(userId);

      if (response.success) {
        res.status(200).json(response);
      } else {
        res.status(400).json(response);
      }
    } catch (error) {
      console.error('Wallet fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: (error as Error).message
      });
    }
  }
  async addMoneyToWallet(req: Request, res: Response): Promise<void> {
    const userId = req.user._id.toString();
    const { amount, reference } = req.body;

    const response = await this.profileService.addMoneyToWallet(userId, amount, reference);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(400).json(response);
    }
  }

  async withdrawMoneyFromWallet(req: Request, res: Response): Promise<void> {
    const userId = req.user._id.toString();
    const { amount } = req.body;

    const response = await this.profileService.withdrawMoneyFromWallet(userId, amount);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(400).json(response);
    }
  }
  // async cancelTicket(req: Request, res: Response): Promise<void> {
  //   try {
  //     const { bookingId } = req.body;
  //     const userId = req.user._id.toString();
      
  //     // Fetch the booking to verify ownership and get ticket price
  //     const booking = await this.bookingRepository.findById(bookingId);
      
  //     if (!booking) {
  //       res.status(404).json({
  //         success: false,
  //         message: "Booking not found"
  //       });
  //       return;
  //     }
      
  //     // Verify that the booking belongs to the user
  //     if (booking.userId.toString() !== userId) {
  //       res.status(403).json({
  //         success: false,
  //         message: "Unauthorized: This booking doesn't belong to you"
  //       });
  //       return;
  //     }
      
  //     // Calculate refund amount (80% of ticket price)
  //     const refundAmount = booking.totalAmount * 0.8;
      
  //     // Update booking status to cancelled
  //     const updatedBooking = await this.bookingRepository.updateBookingStatus(bookingId, 'cancelled');
      
  //     if (!updatedBooking) {
  //       res.status(500).json({
  //         success: false,
  //         message: "Failed to cancel booking"
  //       });
  //       return;
  //     }
      
  //     // Add refund to user's wallet
  //     const walletService = new ProfileService();
  //     const walletResponse = await walletService.addMoneyToWallet(userId, refundAmount, `Refund for booking #${bookingId}`);
      
  //     if (!walletResponse.success) {

  //       console.error("Failed to add refund to wallet:", walletResponse.message);
  //     }
      
  //     res.status(200).json({
  //       success: true,
  //       message: "Booking cancelled successfully",
  //       data: {
  //         booking: updatedBooking,
  //         refundAmount,
  //         walletUpdated: walletResponse.success
  //       }
  //     });
  //   } catch (error) {
  //     console.error("Error in cancelTicket:", error);
  //     res.status(500).json({
  //       success: false,
  //       message: "Internal server error",
  //       error: (error as Error).message
  //     });
  //   }
  // }

}