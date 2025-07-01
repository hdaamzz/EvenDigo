import { IAchievement } from "../../models/interfaces/achievements.interface";

export interface IUserAchievementService {
    checkUserAchievements(userId: string): Promise<void>;
    getUserAchievements(userId: string): Promise<IAchievement[]>;
  }