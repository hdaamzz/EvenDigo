import { Schema } from 'mongoose';
import { ForbiddenException, NotFoundException } from '../../../../error/error-handlers';
import { EventDocument } from '../../../../models/interfaces/event.interface';
import { IEventRepository } from '../../../../repositories/interfaces/IEvent.repository';
import { IEventService } from '../../../../services/interfaces/user/dashboard/IEvent.service';
import { inject, injectable } from 'tsyringe';
import { IBookingRepository } from '../../../../repositories/interfaces/IBooking.repository';
import { IBooking } from '../../../../models/interfaces/booking.interface';
import { IChatService } from '../../../../services/interfaces/user/chat/IChat.service';


@injectable()
export class EventService implements IEventService {
  constructor(
    @inject("EventRepository") private eventRepository: IEventRepository,
    @inject("BookingRepository") private bookingRepository : IBookingRepository,
    @inject('ChatService') private chatService: IChatService
  ) {}

  async createEvent(eventData: Partial<EventDocument>): Promise<EventDocument> {

    const event = this.eventRepository.createEvent(eventData);
    const eventId:string =(await event)._id as unknown as string;
    const creatorId =(await event).user_id as unknown as string
    await this.chatService.createGroupChat(
        eventId,
        (await event).eventTitle || 'Event Group Chat',
        [creatorId] 
      );
    return event
  }

  async getEventsByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    return this.eventRepository.findEventByUserId(userId);
  }

  async getOrganizedEventsByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    return this.eventRepository.findCompletedEventByUserId(userId);
  }

  async getOngoingEventsByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    return this.eventRepository.findOngoingEventByUserId(userId);
  }

  async getParticipatedEventsByUserId(userId: Schema.Types.ObjectId | string): Promise<IBooking[]> {
    return this.bookingRepository.findBookingEventByUserId(userId);
  }

  async getEventById(eventId: Schema.Types.ObjectId | string): Promise<EventDocument | null> {
    return this.eventRepository.findEventById(eventId);
  }

  async verifyEventOwnership(eventId: Schema.Types.ObjectId | string, userId: Schema.Types.ObjectId | string): Promise<void> {
    const event = await this.eventRepository.findEventById(eventId);
    
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    
    if (event.user_id.toString() !== userId.toString()) {
      throw new ForbiddenException('Not authorized to modify this event');
    }
  }

  async updateEvent(eventId: Schema.Types.ObjectId | string, updateData: Partial<EventDocument>): Promise<EventDocument | null> {
    const updatedEvent = await this.eventRepository.updateEvent(eventId, updateData);
    
    if (!updatedEvent) {
      throw new NotFoundException('Event not found');
    }
    
    return updatedEvent;
  }

  async deleteEvent(eventId: Schema.Types.ObjectId | string): Promise<boolean> {
    const result = await this.eventRepository.deleteEvent(eventId);
    
    if (!result) {
      throw new NotFoundException('Event not found');
    }
    
    return true;
  }

  async findAllEvents(): Promise<EventDocument[]> {
    return this.eventRepository.findAllEvents();
  }

  async findAllEventsWithPagination(page: number, limit: number): Promise<{ data: EventDocument[]; total: number; currentPage: number; totalPages: number; }> {
    return this.eventRepository.findAllEventsWithPagination(page, limit, '', 'all');
  }

  async findUpcomingEventsWithoutCurrentUser(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    return this.eventRepository.findUpcomingEventsWithoutCurrentUser(userId);
  }

  async findAllEventWithoutCurrentUser(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    return this.eventRepository.findAllEventWithoutCurrentUser(userId);
  }

  async findEventsByIds(eventIds: (Schema.Types.ObjectId | string)[]): Promise<EventDocument[]> {
    return this.eventRepository.findEventsByIds(eventIds);
  }

  async findDocumentCount(userId: Schema.Types.ObjectId | string): Promise<number> {
    return this.eventRepository.findDocumentCount(userId);
  }
}