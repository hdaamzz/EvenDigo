import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe';
import { IExploreController } from '../../../../src/controllers/interfaces/IExplore.controller';
import { IExploreService } from '../../../../src/services/interfaces/IExplore.service';
import StatusCode from '../../../../src/types/statuscode';

@injectable()
export class ExploreController implements IExploreController {


  constructor(
    @inject("ExploreService") private exploreService: IExploreService
  ) { }

  getAllEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId: string = req.user._id
      const events = await this.exploreService.getEvents(userId);
      res.status(StatusCode.OK).json({ success: true, data: events });
    } catch (error) {
      console.error('Get user events error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ success: false, error: 'Failed to fetch events' });
    }
  };

  checkout = async (req: Request, res: Response): Promise<void> => {
    const { eventId, tickets, amount, successUrl, cancelUrl, paymentMethod, couponCode, discount } = req.body;
    const userId = req.user._id;
  
    try {
      if (paymentMethod === 'wallet') {
        const bookingResult = await this.exploreService.walletBooking(
          eventId, tickets, amount, userId, couponCode, discount
        );
        
        if (bookingResult) {
          const booking = await this.exploreService.processWalletPayment(bookingResult);
          res.status(StatusCode.OK).json({ 
            success: true, 
            data: booking,
            message: 'Booking successful! Payment completed from wallet.'
          });
        } else {
          res.status(StatusCode.BAD_REQUEST).json({ 
            success: false, 
            error: 'Failed to create booking'
          });
        }
      } else {
        const session = await this.exploreService.booking(eventId, tickets, amount, successUrl, cancelUrl, userId, couponCode, discount);
        res.status(StatusCode.OK).json({ success: true, data: { sessionId: session.id } });
      }
    } catch (error) {
      console.error('Error in checkout:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        error: (error as Error).message || 'Failed to process checkout' 
      });
    }
  };

  handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {

    try {
      const sig = req.headers['stripe-signature'] as string;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!endpointSecret) {
        console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
        throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
      }

      if (!Buffer.isBuffer(req.body)) {
        console.error('Request body is not a Buffer');
        throw new Error('Webhook request body must be raw Buffer data');
      }
      const event = this.exploreService.constructStripeEvent(req.body, sig, endpointSecret);

      await this.exploreService.processStripeWebhook(event);

      res.status(StatusCode.OK).json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(StatusCode.BAD_REQUEST).json({ success: false, error: (error as Error).message });
    }
  };

  getBookingDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const sessionId: string = req.query.id as string;
      console.log(sessionId);

      if (!sessionId) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, error: 'SESSION_ID is required' });
        return;
      }

      const bookingDetails = await this.exploreService.getBookingDetails(sessionId);
      res.status(StatusCode.OK).json({ success: true, data: bookingDetails });
    } catch (error) {
      console.error('Get user events error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ success: false, error: 'Failed to fetch events' });
    }
  };



  downloadTickets = async (req: Request, res: Response): Promise<void> => {
    try {
      const bookingId = req.params.bookingId;
      const userId = req.user._id;


      const pdfDoc = await this.exploreService.generateTicketsPdf(bookingId, userId);

      if (!pdfDoc) {
        res.status(StatusCode.NOT_FOUND).json({ success: false, message: 'Booking not found' });
        return;
      }


      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Event_Tickets_${bookingId}.pdf`);


      pdfDoc.pipe(res);
      pdfDoc.end();

    } catch (error) {
      console.error('Error generating tickets:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message || 'Server error'
      });
    }
  };

  downloadInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const bookingId = req.params.bookingId;
      const userId = req.user._id;


      const pdfDoc = await this.exploreService.generateInvoicePdf(bookingId, userId);

      if (!pdfDoc) {
        res.status(StatusCode.NOT_FOUND).json({ success: false, message: 'Booking not found' });
        return;
      }


      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Invoice_${bookingId}.pdf`);

      pdfDoc.pipe(res);
      pdfDoc.end();

    } catch (error) {
      console.error('Error generating invoice:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message || 'Server error'
      });
    }
  };


}