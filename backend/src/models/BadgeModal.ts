import { Schema, model } from 'mongoose';
import { IUserAchievement } from './interfaces/badge.interface';

const userAchievementSchema = new Schema<IUserAchievement>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    achievementId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Achievement', 
      required: true 
    },
    earnedAt: { 
      type: Date, 
      default: Date.now 
    },
    criteriaMet: { 
      type: Map, 
      of: Number, 
      required: true 
    }, 
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export default model<IUserAchievement>('UserAchievement', userAchievementSchema);