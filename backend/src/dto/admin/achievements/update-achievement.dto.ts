export class UpdateAchievementDto {
    title?: string;
    description?: string;
    category?: 'event' | 'user' | 'sales' | 'engagement' | 'other';
    criteria?: 'events_created' | 'events_attended' | 'vip_events_taker' | 'gold_events_taker';
    threshold?: number;
    icon?: string;
    isActive?: boolean;

    constructor(data: any) {
        if (data.title !== undefined) this.title = data.title;
        if (data.description !== undefined) this.description = data.description;
        if (data.category !== undefined) this.category = data.category;
        if (data.criteria !== undefined) this.criteria = data.criteria;
        if (data.threshold !== undefined) this.threshold = data.threshold;
        if (data.icon !== undefined) this.icon = data.icon;
        if (data.isActive !== undefined) this.isActive = data.isActive;
    }

    static fromRequest(requestBody: any): UpdateAchievementDto {
        return new UpdateAchievementDto(requestBody);
    }

    toEntity(): any {
        const entity: any = {};
        if (this.title !== undefined) entity.title = this.title;
        if (this.description !== undefined) entity.description = this.description;
        if (this.category !== undefined) entity.category = this.category;
        if (this.criteria !== undefined) entity.criteria = this.criteria;
        if (this.threshold !== undefined) entity.threshold = this.threshold;
        if (this.icon !== undefined) entity.icon = this.icon;
        if (this.isActive !== undefined) entity.isActive = this.isActive;
        return entity;
    }
}