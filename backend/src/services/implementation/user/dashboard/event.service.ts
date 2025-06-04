import { Schema } from 'mongoose';
import { ForbiddenException, NotFoundException } from '../../../../../src/error/error-handlers';
import { EventDocument } from '../../../../../src/models/interfaces/event.interface';
import { IEventRepository } from '../../../../../src/repositories/interfaces/IEvent.repository';
import { IEventService } from '../../../../../src/services/interfaces/user/dashboard/IEvent.service';
import { inject, injectable } from 'tsyringe';
import { IBookingRepository } from 'src/repositories/interfaces/IBooking.repository';
import { IBooking } from 'src/models/interfaces/booking.interface';


@injectable()
export class EventService implements IEventService {
  constructor(
    @inject("EventRepository") private eventRepository: IEventRepository,
    @inject("BookingRepository") private bookingRepository : IBookingRepository
  ) {}

  async createEvent(eventData: Partial<EventDocument>): Promise<EventDocument> {
    return this.eventRepository.createEvent(eventData);
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

  async findAllEventsWithPagination(page: number, limit: number): Promise<EventDocument[]> {
    return this.eventRepository.findAllEventsWithPagination(page, limit);
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