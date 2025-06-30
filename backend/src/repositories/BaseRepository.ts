import { Schema, Document, Model, FilterQuery } from 'mongoose';
import { IBaseRepository } from './IBase.repository';

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
    protected model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    async findAll(): Promise<T[]> {
        return this.model.find({}).sort({ createdAt: -1 }).exec();
    }

    async findAllPaginated(page: number = 1, limit: number = 10): Promise<{
        items: T[];
        totalCount: number;
        hasMore: boolean;
        currentPage: number;
        totalPages: number;
    }> {
        const skip = (page - 1) * limit;
        
        const [items, totalCount] = await Promise.all([
            this.model.find({})
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.model.countDocuments({})
        ]);
        
        const totalPages = Math.ceil(totalCount / limit);
        const hasMore = totalCount > (skip + items.length);
        
        return { 
            items, 
            totalCount, 
            hasMore, 
            currentPage: page,
            totalPages 
        };
    }

    async findById(id: Schema.Types.ObjectId | string): Promise<T | null> {
        return this.model.findById(id).exec();
    }

    async create(data: Partial<T>): Promise<T> {
        const document = new this.model(data);
        return document.save();
    }

    async update(id: Schema.Types.ObjectId | string, updateData: Partial<T>): Promise<T | null> {
        return this.model.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).exec();
    }

    async delete(id: Schema.Types.ObjectId | string): Promise<void> {
        await this.model.findByIdAndDelete(id).exec();
    }

    async findOne(filter: FilterQuery<T>): Promise<T | null> {
        return this.model.findOne(filter).exec();
    }

    async findMany(filter: FilterQuery<T>): Promise<T[]> {
        return this.model.find(filter).sort({ createdAt: -1 }).exec();
    }

    async count(filter: FilterQuery<T> = {}): Promise<number> {
        return this.model.countDocuments(filter).exec();
    }

    async exists(id: Schema.Types.ObjectId | string): Promise<boolean> {
        const document = await this.model.findById(id).select('_id').exec();
        return document !== null;
    }

    protected async findWithPagination(
        filter: FilterQuery<T>, 
        page: number = 1, 
        limit: number = 10,
        sortBy: Record<string, 1 | -1> = { createdAt: -1 }
    ): Promise<{
        items: T[];
        totalCount: number;
        hasMore: boolean;
        currentPage: number;
        totalPages: number;
    }> {
        const skip = (page - 1) * limit;
        
        const [items, totalCount] = await Promise.all([
            this.model.find(filter)
                .sort(sortBy)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.model.countDocuments(filter)
        ]);
        
        const totalPages = Math.ceil(totalCount / limit);
        const hasMore = totalCount > (skip + items.length);
        
        return { 
            items, 
            totalCount, 
            hasMore, 
            currentPage: page,
            totalPages 
        };
    }
}