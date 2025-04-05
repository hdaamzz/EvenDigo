import { EventDocument } from "../../../models/interfaces/event.interface";
import Stripe from 'stripe';
import { IBookingRepository } from "../../../repositories/booking.repository";
import { ITicket } from "../../../models/interfaces/booking.interface";
import { generateAndUploadQrCode, generateUniqueId } from "../../../utils/helpers";
import { Schema } from "mongoose";
import { inject, injectable } from "tsyringe";
import { IExploreService } from "../../../../src/services/interfaces/IExplore.service";
import { IDashboardRepository } from "../../../../src/repositories/interfaces/IEvent.repository";

@injectable()
export class ExploreService implements IExploreService{
  private stripe: Stripe;

  constructor(
    @inject("DashboardRepository") private dashboardRepository :IDashboardRepository,
    @inject("BookingRepository") private bookingRepository:IBookingRepository
  ) {
    const stripeKey = process.env.STRIPE_KEY;
    if (!stripeKey) {
      throw new Error('STRIPE_KEY environment variable is not set');
    }
    this.stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' });
  }

  async getEvents(id: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    if (!id) throw new Error('ID is required');
    return this.dashboardRepository.findAllEventWithoutCurrentUser(id);
  }
  async getEvent(id: Schema.Types.ObjectId | string): Promise<EventDocument | null> {
    if (!id) throw new Error('ID is required');
    return this.dashboardRepository.findEventById(id);
  }

  async booking(
    eventId: string,
    tickets: { [type: string]: number },
    amount: number,
    successUrl: string,
    cancelUrl: string,
    userId: string,
    couponCode: string | null,
    discount: number
  ): Promise<Stripe.Checkout.Session> {
    try {
      // Validation
      if (!eventId || !userId) throw new Error('Event ID is required');
      if (!Object.keys(tickets).length) throw new Error('At least one ticket is required');
      if (amount <= 0) throw new Error('Amount must be greater than 0');
      if (!successUrl || !cancelUrl) throw new Error('Success and cancel URLs are required');

      // Prepare ticket details for storage
      const ticketDetails = await this.prepareTicketDetails(eventId, tickets);

      // Create Stripe session
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `Tickets for Event ${eventId}`,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { userId: userId.toString(), eventId, couponCode: couponCode || '' },
      });

      // Save booking
      await this.bookingRepository.create({
        bookingId: `BK${Date.now()}${Math.floor(Math.random() * 10000)}`,
        userId,
        eventId,
        tickets: ticketDetails,
        totalAmount: amount,
        paymentType: 'card',
        discount,
        coupon: couponCode,
        stripeSessionId: session.id,
      });

      return session;
    } catch (error) {
      throw new Error(`Booking failed: ${(error as Error).message}`);
    }
  }


  private async prepareTicketDetails(eventId: Schema.Types.ObjectId | string, tickets: { [type: string]: number }): Promise<ITicket[]> {
    // Fetch event details to get ticket pricing (assume an event service exists)
    const event = await this.getEvent(eventId);
    const ticketDetails: ITicket[] = [];
    if (!event) {
      throw new Error(`prepareTicketDetails Event not getting`);
    }
    for (const [type, quantity] of Object.entries(tickets)) {
      if (quantity > 0) {
        const ticketPrice = event.tickets.find((t: any) => t.type === type)?.price || 0;
        ticketDetails.push({
          type,
          price: ticketPrice,
          quantity,
          usedTickets: 0,
          totalPrice: ticketPrice * quantity,
          uniqueId: generateUniqueId(),
          uniqueQrCode: await generateAndUploadQrCode(`${eventId}-${type}-${Date.now()}`),
        });
      }
    }
    return ticketDetails;
  }


}
