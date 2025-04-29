import { Schema } from 'mongoose';

export interface IUserAchievement {
  _id?: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId | string;
  achievementId: Schema.Types.ObjectId | string;
  earnedAt: Date;
  criteriaMet: Map<string, number>;
  createdAt?: Date;
  updatedAt?: Date;
}