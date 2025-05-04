import { ISubscription } from "../../../../models/SubscriptionModal";
import { SubscriptionPayload } from "./ISubscriptionQuery.service";


export interface IWalletSubscriptionService {
  processSubscription(userId: string, payload: SubscriptionPayload): Promise<ISubscription>;
}