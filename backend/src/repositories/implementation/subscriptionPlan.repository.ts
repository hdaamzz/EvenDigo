import { ISubscriptionPlan, SubscriptionPlanModel } from '../../../src/models/SubscriptionPlanModal';
import { injectable } from 'tsyringe';

export interface ISubscriptionPlanRepository {
  findAll(): Promise<ISubscriptionPlan[]>;
  findById(id: string): Promise<ISubscriptionPlan | null>;
  create(data: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan>;
  update(id: string, data: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan | null>;
  delete(id: string): Promise<boolean>;
}

@injectable()
export class SubscriptionPlanRepository implements ISubscriptionPlanRepository {
  async findAll(): Promise<ISubscriptionPlan[]> {
    return await SubscriptionPlanModel.find().sort({ price: 1 });
  }

  async findById(planId: string): Promise<ISubscriptionPlan | null> {
    return await SubscriptionPlanModel.findById(planId);
  }

  async create(data: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan> {
    const plan = new SubscriptionPlanModel(data);
    return await plan.save();
  }

  async update(planId: string, data: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan | null> {
    return await SubscriptionPlanModel.findByIdAndUpdate(
    planId,
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  async delete(planId: string): Promise<boolean> {
    const result = await SubscriptionPlanModel.deleteOne({ _id: planId });
    return result.deletedCount === 1;
  }
}