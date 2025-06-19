import { Schema } from 'mongoose';
import { EventDocument } from '../../../models/interfaces/event.interface';
import { AdminEventListDto, AdminEventDetailDto, AdminTicketDto } from './AdminEventResponseDto';

export class AdminEventMapper {
  static toListDto(event: EventDocument): AdminEventListDto {
    const totalTickets = event.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
    
    return {
      id: (event._id as Schema.Types.ObjectId).toString(),
      eventTitle: event.eventTitle,
      eventType: event.eventType,
      startDate: event.startDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
      endingDate: event.endingDate.toISOString().split('T')[0],
      city: event.city,
      venueName: event.venueName,
      status: event.status ?? true,
      ticketTypes: event.tickets.length,
      totalTickets,
      organizer: {
        id:event.user_id.toString(),
        name: (event.user_id as any).name || 'Unknown Organizer',
        email: (event.user_id as any).email || undefined,
      },
      createdAt: event.createdAt.toISOString(),
    };
  }

  static toDetailDto(event: EventDocument): AdminEventDetailDto {
    const listDto = this.toListDto(event);
    
    return {
      ...listDto,
      eventDescription: event.eventDescription,
      startTime: event.startTime,
      endingTime: event.endingTime,
      eventVisibility: event.eventVisibility,
      venueAddress: event.venueAddress,
      ageRestriction: event.ageRestriction,
      mainBanner: event.mainBanner,
      promotionalImage: event.promotionalImage,
      tickets: event.tickets.map(this.toTicketDto),
      updatedAt: event.updatedAt.toISOString(),
    };
  }

  static toListDtos(events: EventDocument[]): AdminEventListDto[] {
    return events.map(event => this.toListDto(event));
  }

  static toDetailDtos(events: EventDocument[]): AdminEventDetailDto[] {
    return events.map(event => this.toDetailDto(event));
  }

  private static toTicketDto(ticket: any): AdminTicketDto {
    return {
      type: ticket.type,
      price: ticket.price,
      quantity: ticket.quantity,
    };
  }
}