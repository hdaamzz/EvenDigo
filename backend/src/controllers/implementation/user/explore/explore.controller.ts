import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe';
import { IExploreController } from '../../../../controllers/interfaces/User/Explore/IExplore.controller';
import { ResponseHandler } from '../../../../utils/response-handler';
import StatusCode from '../../../../types/statuscode';
import { IExploreService } from '../../../../services/interfaces/user/explore/IExplore.service';
import { IPaymentService } from '../../../../services/interfaces/user/explore/IPaymentService';
import { IBookingService } from '../../../../services/interfaces/user/explore/IBookingService';
import { BadRequestException, NotFoundException } from '../../../../error/error-handlers';
import { ISubscriptionQueryService } from '../../../../services/interfaces/user/subscription/ISubscriptionQuery.service';
import { EventDto } from '../../../../dto/user/explore/explore.dto';

@injectable()
export class ExploreController implements IExploreController {
  constructor(
    @inject("ExploreService") private exploreService: IExploreService,
    @inject("PaymentService") private paymentService: IPaymentService,
    @inject("BookingService") private bookingService: IBookingService,
    @inject("SubscriptionQueryService") private subscriptionService: ISubscriptionQueryService
  ) {}

    getAllEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId: string = req.user._id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      
      const result = await this.exploreService.getEvents(userId, page, limit);
      const eventsDto = result.events.map(event => new EventDto(event));

      ResponseHandler.success(res, {
        events: eventsDto,
        total: result.total,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        hasMore: result.hasMore
      });
    } catch (error) {
      ResponseHandler.error(res, error, 'Failed to fetch events');
    }
  };

  checkout = async (req: Request, res: Response): Promise<void> => {
    const { eventId, tickets, amount, successUrl, cancelUrl, paymentMethod, couponCode, discount } = req.body;
    const userId = req.user._id;
  
    try {
      if (paymentMethod === 'wallet') {
        const booking = await this.paymentService.processWalletPayment(
          eventId, tickets, amount, userId, couponCode, discount
        );
        
        ResponseHandler.success(res, booking, 'Booking successful! Payment completed from wallet.');
      } else {
        const session = await this.paymentService.createStripeCheckoutSession(
          eventId, tickets, amount, successUrl, cancelUrl, userId, couponCode, discount
        );
        
        ResponseHandler.success(res, { sessionId: session.id });
      }
    } catch (error) {
      const statusCode = error instanceof BadRequestException ? 
        StatusCode.BAD_REQUEST : StatusCode.INTERNAL_SERVER_ERROR;
        
      ResponseHandler.error(res, error, 'Failed to process checkout', statusCode);
    }
  };

  handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const sig = req.headers['stripe-signature'] as string;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!endpointSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
      }

      if (!Buffer.isBuffer(req.body)) {
        throw new Error('Webhook request body must be raw Buffer data');
      }
      
      const event = this.paymentService.constructStripeEvent(req.body, sig, endpointSecret);
      
      await this.routeWebhookEvent(event);

      ResponseHandler.success(res, { received: true });
    } catch (error) {
      ResponseHandler.error(res, error, 'Webhook error', StatusCode.BAD_REQUEST);
    }
  };

  private async routeWebhookEvent(event: any): Promise<void> {
    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        if (session.metadata && session.metadata.paymentType === 'subscription') {
          await this.subscriptionService.handleSubscriptionWebhook(event);
        } else {
          await this.paymentService.processStripeWebhook(event);
          
        }
      } else {
        if (event.type.startsWith('customer.subscription') || 
            event.type.startsWith('invoice')) {
          await this.subscriptionService.handleSubscriptionWebhook(event);
        } else {
          await this.paymentService.processStripeWebhook(event);
        }
      }
    } catch (error) {
      console.error("Error in routeWebhookEvent:", error);
      throw new Error(`Error routing webhook event: ${(error as Error).message}`);
    }
  }
  getBookingDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const sessionId: string = req.query.id as string;

      if (!sessionId) {
        throw new BadRequestException('SESSION_ID is required');
      }

      const bookingDetails = await this.bookingService.getBookingDetails(sessionId);
      
      if (!bookingDetails) {
        throw new NotFoundException('Booking not found');
      }
      
      ResponseHandler.success(res, bookingDetails);
    } catch (error) {
      const statusCode = error instanceof BadRequestException ? 
        StatusCode.BAD_REQUEST : 
        error instanceof NotFoundException ? 
          StatusCode.NOT_FOUND : StatusCode.INTERNAL_SERVER_ERROR;
          
      ResponseHandler.error(res, error, 'Failed to fetch booking details', statusCode);
    }
  };

  downloadTickets = async (req: Request, res: Response): Promise<void> => {
    try {
      const bookingId = req.params.bookingId;
      const userId = req.user._id;

      const pdfDoc = await this.bookingService.generateTicketsPdf(bookingId, userId);

      if (!pdfDoc) {
        throw new NotFoundException('Booking not found');
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Event_Tickets_${bookingId}.pdf`);

      pdfDoc.pipe(res);
      pdfDoc.end();

    } catch (error) {
      const statusCode = error instanceof NotFoundException ? 
        StatusCode.NOT_FOUND : StatusCode.INTERNAL_SERVER_ERROR;
        
      ResponseHandler.error(res, error, 'Error generating tickets', statusCode);
    }
  };

  downloadInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const bookingId = req.params.bookingId;
      const userId = req.user._id;

      const pdfDoc = await this.bookingService.generateInvoicePdf(bookingId, userId);

      if (!pdfDoc) {
        throw new NotFoundException('Booking not found');
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Invoice_${bookingId}.pdf`);

      pdfDoc.pipe(res);
      pdfDoc.end();

    } catch (error) {
      const statusCode = error instanceof NotFoundException ? 
        StatusCode.NOT_FOUND : StatusCode.INTERNAL_SERVER_ERROR;
        
      ResponseHandler.error(res, error, 'Error generating invoice', statusCode);
    }
  };
}