export class CreateAchievementDto {
    title: string;
    description: string;
    category: 'event' | 'user' | 'sales' | 'engagement' | 'other';
    criteria: 'events_created' | 'events_attended' | 'vip_events_taker' | 'gold_events_taker';
    threshold: number;
    icon: string;
    isActive?: boolean;

    constructor(data: any) {
        this.title = data.title;
        this.description = data.description;
        this.category = data.category;
        this.criteria = data.criteria;
        this.threshold = data.threshold;
        this.icon = data.icon;
        this.isActive = data.isActive ?? true;
    }

    static fromRequest(requestBody: any): CreateAchievementDto {
        return new CreateAchievementDto(requestBody);
    }

    toEntity(): any {
        return {
            title: this.title,
            description: this.description,
            category: this.category,
            criteria: this.criteria,
            threshold: this.threshold,
            icon: this.icon,
            isActive: this.isActive
        };
    }
}