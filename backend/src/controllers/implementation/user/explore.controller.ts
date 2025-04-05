import {Request ,Response} from 'express'
import { inject, injectable } from 'tsyringe';
import { IExploreController } from '../../../../src/controllers/interfaces/IExplore.controller';
import { IExploreService } from '../../../../src/services/interfaces/IExplore.service';

@injectable()
export class ExploreController implements IExploreController{

    
    constructor(
      @inject("ExploreService") private exploreService:IExploreService
    ) {}

    getAllEvents = async (req: Request, res: Response): Promise<void> => {
        try {
          const userId:string=req.user._id
          const events = await this.exploreService.getEvents(userId);
          res.status(200).json({ success: true, data: events });
        } catch (error) {
          console.error('Get user events error:', error);
          res.status(500).json({ success: false, error: 'Failed to fetch events' });
        }
      };

      checkout = async (req: Request, res: Response): Promise<void> => {
        const { eventId, tickets, amount, successUrl, cancelUrl, paymentMethod, couponCode, discount } = req.body;
        const userId = req.user._id;
    
        try {
          if (paymentMethod === 'wallet') {
        
          } else {
            // Create Stripe session for card payment
            const session = await this.exploreService.booking(eventId, tickets, amount, successUrl, cancelUrl, userId, couponCode, discount);
            res.status(200).json({ success: true, data: { sessionId: session.id } });
          }
        } catch (error) {
          console.error('Error in checkout:', error);
          res.status(500).json({ success: false, error: (error as Error).message || 'Failed to process checkout' });
        }
      };
}