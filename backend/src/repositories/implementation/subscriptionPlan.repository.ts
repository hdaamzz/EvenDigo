import { SubscriptionPlanModel } from '../../models/SubscriptionPlanModal';
import { injectable } from 'tsyringe';
import { BaseRepository } from '../BaseRepository';
import { ISubscriptionPlanRepository } from '../interfaces/ISubscriptionPlan.repository';
import { ISubscriptionPlan } from '../../models/interfaces/subscriptionPlan.interface';



@injectable()
export class SubscriptionPlanRepository extends BaseRepository<ISubscriptionPlan> implements ISubscriptionPlanRepository {
  
  constructor() {
    super(SubscriptionPlanModel);
  }

  async findAll(): Promise<ISubscriptionPlan[]> {
    return await this.findWithSort({}, { price: 1 });
  }

  async findById(planId: string): Promise<ISubscriptionPlan | null> {
    return await super.findById(planId);
  }

  async findByType(planType: string): Promise<ISubscriptionPlan | null> {
    return await this.findOne({ type: planType });
  }

  async create(data: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan> {
    return await super.create(data);
  }

  async update(planId: string, data: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan | null> {
    return await this.updateById(planId, data);
  }

  async delete(planId: string): Promise<boolean> {
    return await this.deleteById(planId);
  }
}