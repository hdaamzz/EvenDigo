import { ISubscriptionPlan } from "../../../models/interfaces/subscriptionPlan.interface";

export interface ISubscriptionPlanService {
  getAllPlans(): Promise<ISubscriptionPlan[]>;
  getPlanById(id: string): Promise<ISubscriptionPlan | null>;
  getPlanByType(type: string): Promise<ISubscriptionPlan | null>;
  createPlan(planData: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan>;
  updatePlan(id: string, planData: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan | null>;
  deletePlan(id: string): Promise<boolean>;
}