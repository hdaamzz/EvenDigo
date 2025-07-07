import { ISubscriptionPlan } from "../../models/interfaces/subscriptionPlan.interface";

export interface ISubscriptionPlanRepository {
  findAll(): Promise<ISubscriptionPlan[]>;
  findById(id: string): Promise<ISubscriptionPlan | null>;
  findByType(type: string): Promise<ISubscriptionPlan | null>;
  create(data: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan>;
  update(id: string, data: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan | null>;
  delete(id: string): Promise<boolean>;
}