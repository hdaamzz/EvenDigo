import { Schema } from 'mongoose';
import { EventDocument } from '../../models/interfaces/event.interface';
import { IBooking } from '../../models/interfaces/booking.interface';
import PDFDocument from 'pdfkit';

export interface IExploreService {
  getEvents(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]>;
  getEvent(id: Schema.Types.ObjectId | string): Promise<EventDocument | null>;
}