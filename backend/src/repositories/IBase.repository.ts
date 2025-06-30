import { Schema, Document } from 'mongoose';

export interface IBaseRepository<T extends Document> {
    findAll(): Promise<T[]>;
    findAllPaginated(page?: number, limit?: number): Promise<{
        items: T[];
        totalCount: number;
        hasMore: boolean;
        currentPage: number;
        totalPages: number;
    }>;
    findById(id: Schema.Types.ObjectId | string): Promise<T | null>;
    create(data: Partial<T>): Promise<T>;
    update(id: Schema.Types.ObjectId | string, updateData: Partial<T>): Promise<T | null>;
    delete(id: Schema.Types.ObjectId | string): Promise<void>;
    findOne(filter: Record<string, any>): Promise<T | null>;
    findMany(filter: Record<string, any>): Promise<T[]>;
    count(filter?: Record<string, any>): Promise<number>;
    exists(id: Schema.Types.ObjectId | string): Promise<boolean>;
}