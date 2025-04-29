import { injectable } from 'tsyringe';
import { IAchievement } from '../models/interfaces/achievements.interface';
import { IUserAchievementRepository } from './interfaces/IBadge.repository';
import AchievementModel from '../models/AchievementsModal';
import BadgeModal from '../models/BadgeModal';
import { Schema } from 'mongoose';

@injectable()
export class UserAchievementRepository implements IUserAchievementRepository {
  async checkAndAssignAchievement(userId: string, criteriaType: string, criteriaValue: number): Promise<void> {
    // Find all relevant achievements where the criteria matches and threshold is less than or equal to value
    const achievements = await AchievementModel.find({
      criteria: criteriaType, // Simple string match
      threshold: { $lte: criteriaValue }, // Threshold check
      isActive: true
    }).exec();

    
    // For each qualifying achievement, assign it to the user if they don't already have it
    for (const achievement of achievements) {
      // Check if user already has this achievement
      const existing = await BadgeModal.findOne({
        userId,
        achievementId: achievement._id,
      }).exec();
      
      // If not, create a new badge record
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

  async getUserAchievements(userId: string): Promise<IAchievement[]> {
    const userAchievements = await BadgeModal.aggregate([
      { $match: { userId: new Schema.Types.ObjectId(userId) } },
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