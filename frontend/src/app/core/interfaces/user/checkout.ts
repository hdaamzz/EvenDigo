export interface TicketData {
  eventId: string;
  tickets: { [type: string]: number };
  totalAmount: number;
  eventTitle: string;
}

export interface Coupon {
  _id: string;
  code: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  minAmount: number;
  maxUses: number | 'Unlimited';
  usageCount: number;
  expiryDate: Date | null;
  status: 'active' | 'inactive';
}