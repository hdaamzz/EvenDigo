import { Document, Schema, model } from "mongoose";
import { IBooking } from "src/models/interfaces/booking.interface";

const ticketSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    usedTickets: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    uniqueId: {
        type: String,
        required: true,
        unique: true
    },
    uniqueQrCode: {
        type: String,
        required: true,
        unique: true
    },
    status:{
        type:String,
        required:true,
        default:'Success'
    }
});

const bookingSchema = new Schema({
    bookingId: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    eventId: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    tickets: {
        type: [ticketSchema],
        required: true,
        validate: [(array: string | any[]) => array.length > 0, 'At least one ticket is required']
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentType: {
        type: String,
        required: true,
    },
    discount: {
        type: Number,
        min: 0,
        default: 0
    },
    coupon: {
        type: String,
        default: null
    },
    stripeSessionId:{
        type:String,
        optional:true
    },
    paymentStatus:{
        type:String,
        optional:true
    }
}, {
    timestamps: true,
});

export const BookingsModel = model<IBooking & Document>('Bookings', bookingSchema);