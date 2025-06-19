import { AchievementDto } from "./achievement.dto";

export class AchievementResponseDto {
    success: boolean;
    data?: AchievementDto | AchievementDto[];
    message?: string;
    pagination?: {
        totalCount: number;
        totalPages: number;
        currentPage: number;
        hasMore: boolean;
    };

    constructor(success: boolean, data?: any, message?: string, pagination?: any) {
        this.success = success;
        if (data) {
            if (Array.isArray(data)) {
                this.data = AchievementDto.fromEntities(data);
            } else {
                this.data = AchievementDto.fromEntity(data);
            }
        }
        this.message = message;
        this.pagination = pagination;
    }

    static success(data: any, pagination?: any): AchievementResponseDto {
        return new AchievementResponseDto(true, data, undefined, pagination);
    }

    static error(message: string): AchievementResponseDto {
        return new AchievementResponseDto(false, undefined, message);
    }
}