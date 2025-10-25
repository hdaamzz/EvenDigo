import { IAchievement } from "../../../models/interfaces/achievements.interface";

export class AchievementDto {
    _id: string;
    title: string;
    description: string;
    category: string;
    criteria: string;
    threshold: number;
    icon: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: IAchievement) {
        this._id = data._id?.toString() || '';
        this.title = data.title;
        this.description = data.description;
        this.category = data.category;
        this.criteria = data.criteria;
        this.threshold = data.threshold;
        this.icon = data.icon;
        this.isActive = data.isActive;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    static fromEntity(entity: IAchievement): AchievementDto {
        return new AchievementDto(entity);
    }

    static fromEntities(entities: IAchievement[]): AchievementDto[] {
        return entities.map(entity => new AchievementDto(entity));
    }
}
