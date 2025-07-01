import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IProfileBookingController } from '../../../../controllers/interfaces/User/Profile/IProfileBooking.controller';
import { ResponseHandler } from '../../../../utils/response-handler';
import { IProfileBookingService } from '../../../../services/interfaces/user/profile/IProfileBooking.service';

@injectable()
export class ProfileBookingController implements IProfileBookingController {
  constructor(
    @inject("ProfileBookingService") private profileBookingService: IProfileBookingService,
  ) {}

  async getUserBookings(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?._id) {
        return ResponseHandler.error(res, null, "User not authenticated", 401);
      }
      
      const userId = req.user._id.toString();
      const bookings = await this.profileBookingService.getUserBookings(userId);
      
      ResponseHandler.success(res, bookings, "User bookings retrieved successfully");
    } catch (error) {
      ResponseHandler.error(res, error, "Failed to fetch user bookings");
    }
  }

  async cancelTicket(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?._id) {
        return ResponseHandler.error(res, null, "User not authenticated", 401);
      }
      
      const userId = req.user._id.toString();
      const { bookingId, ticketUniqueId } = req.body;
      
      if (!bookingId || !ticketUniqueId) {
        return ResponseHandler.error(res, null, "Booking ID and ticket ID are required", 400);
      }
      
      const result = await this.profileBookingService.cancelTicket(userId, bookingId, ticketUniqueId);
      
      if (result.success) {
        ResponseHandler.success(res, result.data, result.message);
      } else {
        ResponseHandler.error(res, null, result.message, 400);
      }
    } catch (error) {
      ResponseHandler.error(res, error, "Failed to cancel ticket");
    }
  }
}