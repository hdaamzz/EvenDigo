import { IAchievement } from "src/models/interfaces/achievements.interface";
import { AchievementDto } from "./achievement.dto";

interface ServicePaginationResult {
    achievements: IAchievement[];
    totalCount: number;
    hasMore: boolean;
}

export class AchievementListResponseDto {
    success: boolean;
    data: AchievementDto[];
    pagination: {
        totalCount: number;
        totalPages: number;
        currentPage: number;
        hasMore: boolean;
    };

    constructor(
        achievements: IAchievement[], 
        totalCount: number, 
        currentPage: number, 
        limit: number, 
        hasMore: boolean
    ) {        
        this.success = true;
        this.data = AchievementDto.fromEntities(achievements);
        this.pagination = {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage,
            hasMore
        };
    }

    static fromServiceResult(
        result: ServicePaginationResult, 
        currentPage: number, 
        limit: number
    ): AchievementListResponseDto {
        return new AchievementListResponseDto(
            result.achievements,
            result.totalCount,
            currentPage,
            limit,
            result.hasMore
        );
    }
}
