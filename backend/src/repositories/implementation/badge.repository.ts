import { injectable } from 'tsyringe';
import { IUserAchievementRepository } from '../interfaces/IBadge.repository';
import AchievementModel from '../../models/AchievementsModel';
import BadgeModal from '../../models/BadgeModal';
import { Schema } from 'mongoose';

@injectable()
export class UserAchievementRepository implements IUserAchievementRepository {
  async checkAndAssignAchievement(userId: string, criteriaType: string, criteriaValue: number): Promise<void> {
    const achievements = await AchievementModel.find({
      criteria: criteriaType,
      threshold: { $lte: criteriaValue }, 
      isActive: true
    }).exec();

    
    for (const achievement of achievements) {
      const existing = await BadgeModal.findOne({
        userId,
        achievementId: achievement._id,
      }).exec();
      
      if (!existing) {
        const criteriaMet = new Map();
        criteriaMet.set(criteriaType, criteriaValue);
        
        await BadgeModal.create({
          userId,
          achievementId: achievement._id,
          criteriaMet, 
          earnedAt: new Date()
        });
      }
    }
  }

  async getUserAchievements(userId: Schema.Types.ObjectId | string): Promise<any> {
    const userAchievements = await BadgeModal.aggregate([
      { $match: { userId: userId } },
      {
        $lookup: {
          from: 'achievements',
          localField: 'achievementId',
          foreignField: '_id',
          as: 'achievementDetails',
        },
      },
      { $unwind: '$achievementDetails' },
      { $replaceRoot: { newRoot: '$achievementDetails' } },
    ]).exec();
    
    return userAchievements;
  }
}