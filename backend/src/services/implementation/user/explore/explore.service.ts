import { inject, injectable } from 'tsyringe';
import { Schema } from 'mongoose';
import { IExploreService } from '../../../../../src/services/interfaces/user/explore/IExplore.service';
import { IEventRepository } from '../../../../../src/repositories/interfaces/IEvent.repository';
import { EventDocument } from '../../../../../src/models/interfaces/event.interface';


@injectable()
export class ExploreService implements IExploreService {
  constructor(
    @inject("EventRepository") private eventRepository: IEventRepository
  ) {}

  async getEvents(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    if (!userId) throw new Error('User ID is required');
    return this.eventRepository.findUpcomingEventsWithoutCurrentUser(userId);
  }
  
  async getEvent(eventId: Schema.Types.ObjectId | string): Promise<EventDocument | null> {
    if (!eventId) throw new Error('Event ID is required');
    return this.eventRepository.findEventById(eventId);
  }
}