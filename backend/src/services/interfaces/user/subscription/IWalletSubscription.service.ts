import { ISubscription } from "../../../../models/interfaces/subscription.interface";
import { SubscriptionPayload } from "./ISubscriptionQuery.service";


export interface IWalletSubscriptionService {
  processSubscription(userId: string, payload: SubscriptionPayload): Promise<ISubscription>;
}