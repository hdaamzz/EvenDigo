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

    constructor(data: any) {
        this._id = data._id?.toString() || data.id;
        this.title = data.title;
        this.description = data.description;
        this.category = data.category;
        this.criteria = data.criteria;
        this.threshold = data.threshold;
        this.icon = data.icon;
        this.isActive = data.isActive;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    static fromEntity(entity: any): AchievementDto {
        return new AchievementDto(entity);
    }

    static fromEntities(entities: any[]): AchievementDto[] {
        return entities.map(entity => new AchievementDto(entity));
    }
}