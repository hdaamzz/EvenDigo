import { EventDocument } from "../../../models/interfaces/event.interface";
import { AdminEventDTO, AdminEventListDTO } from "./event.dto";
import { ObjectId } from "mongoose";


export class AdminEventMapper {
  static toAdminEventDTO(event: EventDocument): AdminEventDTO {
    
    return {
      _id: (event._id as string),
      user_id: (event.user_id as unknown as string),
      eventTitle: event.eventTitle,
      eventDescription: event.eventDescription,
      eventType: event.eventType,
      startDate: event.startDate,
      startTime: event.startTime,
      endingDate: event.endingDate,
      endingTime: event.endingTime,
      eventVisibility: event.eventVisibility,
      venueName: event.venueName,
      venueAddress: event.venueAddress,
      city: event.city,
      tickets: event.tickets.map(ticket => ({
        type: ticket.type,
        price: ticket.price,
        quantity: ticket.quantity
      })),
      ageRestriction: event.ageRestriction,
      mainBanner: event.mainBanner,
      promotionalImage: event.promotionalImage,
      status: event.status ?? true,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    };
  }

  static toAdminEventListDTO(event: EventDocument): AdminEventListDTO {
    return {
      _id: (event._id as ObjectId).toString(),
      user_id: (event.user_id as unknown as string),
      eventTitle: event.eventTitle,
      eventDescription: event.eventDescription,
      eventType: event.eventType,
      startDate: event.startDate,
      startTime: event.startTime,
      endingDate: event.endingDate,
      endingTime: event.endingTime,
      eventVisibility: event.eventVisibility,
      venueName: event.venueName,
      venueAddress: event.venueAddress,
      city: event.city,
      tickets: event.tickets.map(ticket => ({
        type: ticket.type,
        price: ticket.price,
        quantity: ticket.quantity
      })),
      ageRestriction: event.ageRestriction,
      mainBanner: event.mainBanner,
      promotionalImage: event.promotionalImage,
      status: event.status ?? true,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    };
  }

  static toAdminEventDTOArray(events: EventDocument[]): AdminEventDTO[] {
    return events.map(event => this.toAdminEventDTO(event));
  }

  static toAdminEventListDTOArray(events: EventDocument[]): AdminEventListDTO[] {
    return events.map(event => this.toAdminEventListDTO(event));
  }
}