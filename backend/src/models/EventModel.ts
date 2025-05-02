import {Schema, model} from 'mongoose';
import { EventDocument } from './interfaces/event.interface';

const eventSchema = new Schema({
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventTitle: {
      type: String,
      required: true
    },
    eventDescription: {
      type: String,
      required: true
    },
    eventType: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endingDate: {
      type: Date,
      required: true
    },
    endingTime: {
      type: String,
      optional:true
    },
    eventVisibility: {
      type: String,
      enum: ['Public', 'Private'],
      required: true
    },
    venueName: {
      type: String,
      required: true
    },
    venueAddress: {
      type: String,
      optional: true
    },
    city: {
      type: String,
      required: true
    },
    tickets: [{
      type: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
    }],
    ageRestriction: {
      type: Boolean,
      required: true
    },
    mainBanner: {
      type: String,
      required: true
    },
    promotionalImage: {
      type: String
    },
    status: {
      type: Boolean,
      default:true
    }
  }, {
    timestamps: true,
  });
  
  export const EventModel = model<EventDocument>('Event', eventSchema);

