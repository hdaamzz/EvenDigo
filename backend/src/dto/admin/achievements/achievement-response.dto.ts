import { AchievementDto } from "./achievement.dto";
import { IAchievement } from "src/models/interfaces/achievements.interface";

interface PaginationInfo {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasMore: boolean;
}

export class AchievementResponseDto {
    success: boolean;
    data?: AchievementDto | AchievementDto[];
    message?: string;
    pagination?: PaginationInfo;

    constructor(
        success: boolean, 
        data?: IAchievement | IAchievement[], 
        message?: string, 
        pagination?: PaginationInfo
    ) {
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

    static success(
        data: IAchievement | IAchievement[], 
        pagination?: PaginationInfo
    ): AchievementResponseDto {
        return new AchievementResponseDto(true, data, undefined, pagination);
    }

    static error(message: string): AchievementResponseDto {
        return new AchievementResponseDto(false, undefined, message);
    }
}
