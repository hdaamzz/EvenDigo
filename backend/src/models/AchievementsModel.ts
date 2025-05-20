import { Schema, model } from 'mongoose';
import { IAchievement } from './interfaces/achievements.interface';

const achievementSchema = new Schema<IAchievement>({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    category: {
        type: String,
        required: true,
        enum: ['event', 'user', 'sales', 'engagement', 'other']
    },
    criteria: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
        enum: [
            'events_created', 
            'events_attended', 
            'vip_events_taker', 
            'gold_events_taker'      
          ]
    },
    threshold: {
        type: Number,
        required: true,
        min: 1,
        max: 10000
    },
    icon: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default model<IAchievement>('Achievement', achievementSchema);