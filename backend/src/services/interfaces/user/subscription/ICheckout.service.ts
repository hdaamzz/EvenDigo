import { SubscriptionPayload } from "./ISubscriptionQuery.service";

export interface ICheckoutService {
  createCheckoutSession(userId: string, payload: SubscriptionPayload): Promise<{ sessionId: string }>;
}