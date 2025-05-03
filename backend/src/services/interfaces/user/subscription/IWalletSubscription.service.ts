import { ISubscription } from "../../../../../src/models/user/SubscriptionModal";
import { SubscriptionPayload } from "./ISubscriptionQuery.service";


export interface IWalletSubscriptionService {
  processSubscription(userId: string, payload: SubscriptionPayload): Promise<ISubscription>;
}