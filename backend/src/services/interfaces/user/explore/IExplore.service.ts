import { Schema } from 'mongoose';
import { EventDocument } from '../../../../models/interfaces/event.interface';

export interface IExploreService {
  getEvents(
    userId: Schema.Types.ObjectId | string, 
    page?: number, 
    limit?: number
  ): Promise<{
    events: EventDocument[];
    total: number;
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
  }>;
  getEvent(id: Schema.Types.ObjectId | string): Promise<EventDocument | null>;
}