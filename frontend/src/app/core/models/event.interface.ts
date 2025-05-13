import { User } from "./userModel";

export interface Ticket {
    type: string;
    price: number;
    quantity:number;
  }
export interface IEvent {
    _id:string;
    user_id: User;
    eventTitle: string;
    eventDescription: string;
    eventType: string;
    startDate: Date;
    startTime: string;
    endingDate: Date;
    endingTime: string;
    eventVisibility: string;
    venueName: string;
    venueAddress?: string;
    city: string;
    tickets: Ticket[];
    ageRestriction: boolean;
    mainBanner: string;
    promotionalImage?: string;
    status?:boolean
    createdAt: Date;
    updatedAt: Date;
  }

  export interface CardIEvent extends IEvent{
    bookingId:string;
  }

export interface EventResponse{
  success:boolean;
  error?:string;
  data?:IEvent
}

export interface AllEventResponse{
  success:boolean;
  error?:string;
  data?:IEvent[]
}
