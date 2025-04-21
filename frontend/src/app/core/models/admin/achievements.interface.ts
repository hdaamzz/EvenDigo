export interface IAchievement {
    _id?: string;
    title: string;
    description: string;
    category: string; 
    criteria: string;  
    threshold: number; 
    icon: string;      
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface AchievementResponse {
    success: boolean;
    data: IAchievement[];
    pagination?: {
      currentPage: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
      hasMore: boolean;
    };
    message?: string;
  }