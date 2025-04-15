import 'express-session';

declare module 'express-session' {
  interface SessionData {
    bookingDetails?: {
      userId: string;
      eventId: string;
      couponCode: string;
      bookingId: string;
      ticketDetails: string;
      totalAmount: string;
      discount: string;
    };
  }
}