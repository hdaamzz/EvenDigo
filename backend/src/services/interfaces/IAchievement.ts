import { IAchievement } from "../../../src/models/interfaces/achievements.interface";

export interface IUserAchievementService {
    checkUserAchievements(userId: string): Promise<void>;
    getUserAchievements(userId: string): Promise<IAchievement[]>;
  }