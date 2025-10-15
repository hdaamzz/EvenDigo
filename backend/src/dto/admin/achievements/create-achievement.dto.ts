type AchievementCategory = 'event' | 'user' | 'sales' | 'engagement' | 'other';
type AchievementCriteria = 'events_created' | 'events_attended' | 'vip_events_taker' | 'gold_events_taker';

interface CreateAchievementInput {
    title: string;
    description: string;
    category: AchievementCategory;
    criteria: AchievementCriteria;
    threshold: number;
    icon: string;
    isActive?: boolean;
}

export class CreateAchievementDto {
    title: string;
    description: string;
    category: AchievementCategory;
    criteria: AchievementCriteria;
    threshold: number;
    icon: string;
    isActive?: boolean;

    constructor(data: CreateAchievementInput) {
        this.title = data.title;
        this.description = data.description;
        this.category = data.category;
        this.criteria = data.criteria;
        this.threshold = data.threshold;
        this.icon = data.icon;
        this.isActive = data.isActive ?? true;
    }

    static fromRequest(requestBody: CreateAchievementInput): CreateAchievementDto {
        return new CreateAchievementDto(requestBody);
    }

    toEntity(): Omit<CreateAchievementInput, 'isActive'> & { isActive: boolean } {
        return {
            title: this.title,
            description: this.description,
            category: this.category,
            criteria: this.criteria,
            threshold: this.threshold,
            icon: this.icon,
            isActive: this.isActive ?? true
        };
    }
}
