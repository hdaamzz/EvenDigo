import { Request, Response } from 'express';
import { IProfileService } from '../../../../../src/services/interfaces/IProfile.service';
import StatusCode from '../../../../../src/types/statuscode';

import { inject, injectable } from 'tsyringe';
import { IProfileBookingController } from '../../../../../src/controllers/interfaces/User/Profile/IProfileBooking.controller';



@injectable()
export class ProfileBookingController implements IProfileBookingController{
  constructor(
    @inject("ProfileService")   private profileService: IProfileService,
    
  ) {}

  async getUserBookings(req: Request, res: Response): Promise<void> {
    const userId = req.user._id.toString();
    try {
      const bookings = await this.profileService.getUserBookings(userId);
      res.status(StatusCode.OK).json({ success: true, data: bookings });
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ success: false, error: (error as Error).message });
    }
  }

  async cancelTicket(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user._id.toString();
      const { bookingId, ticketUniqueId } = req.body;
  
      if (!bookingId || !ticketUniqueId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Booking ID and ticket ID are required'
        });
        return;
      }
  
      const result = await this.profileService.cancelTicket(userId, bookingId, ticketUniqueId);
      
      if (result.success) {
        res.status(StatusCode.OK).json(result);
      } else {
        res.status(StatusCode.BAD_REQUEST).json(result);
      }
    } catch (error) {
      console.error('Ticket cancellation error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to cancel ticket',
        error: (error as Error).message
      });
    }
  }

}