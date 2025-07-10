import { inject, injectable } from 'tsyringe';
import { Schema } from 'mongoose';
import { IExploreService } from '../../../../services/interfaces/user/explore/IExplore.service';
import { IEventRepository } from '../../../../repositories/interfaces/IEvent.repository';
import { EventDocument } from '../../../../models/interfaces/event.interface';


@injectable()
export class ExploreService implements IExploreService {
  constructor(
    @inject("EventRepository") private eventRepository: IEventRepository
  ) {}

  async getEvents(
    userId: Schema.Types.ObjectId | string, 
    page: number = 1, 
    limit: number = 12
  ): Promise<{
    events: EventDocument[];
    total: number;
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
  }> {
    if (!userId) throw new Error('User ID is required');
    
    return this.eventRepository.findUpcomingEventsWithoutCurrentUserPaginated(userId, page, limit);
  }
  
  async getEvent(eventId: Schema.Types.ObjectId | string): Promise<EventDocument | null> {
    if (!eventId) throw new Error('Event ID is required');
    return this.eventRepository.findEventById(eventId);
  }
}