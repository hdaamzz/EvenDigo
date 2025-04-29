import { IAchievement } from "../../../src/models/interfaces/achievements.interface";

export interface IUserAchievementRepository {
  checkAndAssignAchievement(userId: string, criteriaType: string, criteriaValue: number): Promise<void>;
  getUserAchievements(userId: string): Promise<IAchievement[]>;
  }

  