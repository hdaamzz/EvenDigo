import { ISubscriptionPlan } from '../../../../src/models/SubscriptionPlanModal';
import { ISubscriptionPlanRepository } from '../../../../src/repositories/implementation/subscriptionPlan.repository';
import { injectable, inject } from 'tsyringe';


export interface ISubscriptionPlanService {
  getAllPlans(): Promise<ISubscriptionPlan[]>;
  getPlanById(id: string): Promise<ISubscriptionPlan | null>;
  getPlanByType(type: string): Promise<ISubscriptionPlan | null>;
  createPlan(planData: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan>;
  updatePlan(id: string, planData: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan | null>;
  deletePlan(id: string): Promise<boolean>;
}

@injectable()
export class SubscriptionPlanService implements ISubscriptionPlanService {
  constructor(
    @inject('SubscriptionPlanRepository') 
    private repository: ISubscriptionPlanRepository
  ) {}

  async getAllPlans(): Promise<ISubscriptionPlan[]> {
    return await this.repository.findAll();
  }

  async getPlanById(id: string): Promise<ISubscriptionPlan | null> {
    return await this.repository.findById(id);
  }
  async getPlanByType(type: string): Promise<ISubscriptionPlan | null> {
    return await this.repository.findByType(type);
  }

  async createPlan(planData: Omit<ISubscriptionPlan, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<ISubscriptionPlan> {
    return await this.repository.create(planData);
  }

  async updatePlan(id: string, planData: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan | null> {
    return await this.repository.update(id, planData);
  }

  async deletePlan(id: string): Promise<boolean> {
    return await this.repository.delete(id);
  }
}