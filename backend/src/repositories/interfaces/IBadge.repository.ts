import { Schema } from "mongoose";
import { IAchievement } from "../../../src/models/interfaces/achievements.interface";

export interface IUserAchievementRepository {
  checkAndAssignAchievement(userId: string, criteriaType: string, criteriaValue: number): Promise<void>;
  getUserAchievements(userId: Schema.Types.ObjectId | string): Promise<IAchievement[]>;
  }

  