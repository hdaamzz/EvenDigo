import { Schema } from 'mongoose';

export interface AchievementEntityDTO {
  _id?: Schema.Types.ObjectId;
  title: string;
  description: string;
  category: 'event' | 'user' | 'sales' | 'engagement' | 'other';
  criteria: string;
  threshold: number;
  icon: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AchievementResponseDTO {
  id: string;
  title: string;
  description: string;
  category: 'event' | 'user' | 'sales' | 'engagement' | 'other';
  criteria: string;
  threshold: number;
  icon: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAchievementDTO {
  title: string;
  description: string;
  category: 'event' | 'user' | 'sales' | 'engagement' | 'other';
  criteria: string;
  threshold: number;
  icon: string;
  isActive?: boolean;
}

export interface UpdateAchievementDTO {
  title?: string;
  description?: string;
  category?: 'event' | 'user' | 'sales' | 'engagement' | 'other';
  criteria?: string;
  threshold?: number;
  icon?: string;
  isActive?: boolean;
}

export interface AchievementPaginationResponseDTO {
  achievements: AchievementResponseDTO[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

export class AchievementMapper {
  static toResponseDTO(entity: AchievementEntityDTO): AchievementResponseDTO {
    return {
      id: entity._id?.toString() || '',
      title: entity.title,
      description: entity.description,
      category: entity.category,
      criteria: entity.criteria,
      threshold: entity.threshold,
      icon: entity.icon,
      isActive: entity.isActive,
      createdAt: entity.createdAt?.toISOString(),
      updatedAt: entity.updatedAt?.toISOString()
    };
  }

  static toResponseDTOList(entities: AchievementEntityDTO[]): AchievementResponseDTO[] {
    return entities.map(entity => this.toResponseDTO(entity));
  }

  static toEntity(dto: CreateAchievementDTO): Partial<AchievementEntityDTO> {
    return {
      title: dto.title,
      description: dto.description,
      category: dto.category,
      criteria: dto.criteria,
      threshold: dto.threshold,
      icon: dto.icon,
      isActive: dto.isActive ?? true
    };
  }

  static toUpdateEntity(dto: UpdateAchievementDTO): Partial<AchievementEntityDTO> {
    const entity: Partial<AchievementEntityDTO> = {};
    
    if (dto.title !== undefined) entity.title = dto.title;
    if (dto.description !== undefined) entity.description = dto.description;
    if (dto.category !== undefined) entity.category = dto.category;
    if (dto.criteria !== undefined) entity.criteria = dto.criteria;
    if (dto.threshold !== undefined) entity.threshold = dto.threshold;
    if (dto.icon !== undefined) entity.icon = dto.icon;
    if (dto.isActive !== undefined) entity.isActive = dto.isActive;
    
    return entity;
  }

  static toPaginationResponseDTO(
    entities: AchievementEntityDTO[], 
    totalCount: number, 
    hasMore: boolean, 
    currentPage: number, 
    limit: number
  ): AchievementPaginationResponseDTO {
    return {
      achievements: this.toResponseDTOList(entities),
      totalCount,
      hasMore,
      currentPage,
      totalPages: Math.ceil(totalCount / limit)
    };
  }
}