import Stripe from 'stripe';
import { Schema } from 'mongoose';
import { EventDocument } from '../../models/interfaces/event.interface';

export interface IExploreService {
  getEvents(id: Schema.Types.ObjectId | string): Promise<EventDocument[]>;
  getEvent(id: Schema.Types.ObjectId | string): Promise<EventDocument | null>;
  booking(
    eventId:  Schema.Types.ObjectId | string,
    tickets: { [type: string]: number },
    amount: number,
    successUrl: string,
    cancelUrl: string,
    userId: string,
    couponCode: string | null,
    discount: number
  ): Promise<Stripe.Checkout.Session>;
}
