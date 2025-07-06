import { Schema, Document, Model } from 'mongoose';
import { IBaseRepository, IPaginationResult, IPaginationOptions } from './IBase.repository';

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return await document.save();
  }

  async findById(id: Schema.Types.ObjectId | string): Promise<T | null> {
    return await this.model.findById(id).exec();
  }

  async findOne(filter: Record<string, any>): Promise<T | null> {
    return await this.model.findOne(filter).exec();
  }

  async findAll(filter: Record<string, any> = {}): Promise<T[]> {
    return await this.model.find(filter).exec();
  }

  async updateById(id: Schema.Types.ObjectId | string, updateData: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();
  }

  async updateOne(filter: Record<string, any>, updateData: Partial<T>): Promise<T | null> {
    return await this.model.findOneAndUpdate(
      filter,
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();
  }

  async updateMany(filter: Record<string, any>, updateData: Partial<T>): Promise<{ modifiedCount: number; success: boolean }> {
    const result = await this.model.updateMany(filter, { $set: updateData }).exec();
    return {
      modifiedCount: result.modifiedCount,
      success: result.modifiedCount > 0
    };
  }

  async deleteById(id: Schema.Types.ObjectId | string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async deleteOne(filter: Record<string, any>): Promise<boolean> {
    const result = await this.model.findOneAndDelete(filter).exec();
    return result !== null;
  }

  async deleteMany(filter: Record<string, any>): Promise<{ deletedCount: number; success: boolean }> {
    const result = await this.model.deleteMany(filter).exec();
    return {
      deletedCount: result.deletedCount || 0,
      success: (result.deletedCount || 0) > 0
    };
  }

  async findWithPagination(
    filter: Record<string, any>,
    options: IPaginationOptions = {}
  ): Promise<IPaginationResult<T>> {
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      select,
      populate
    } = options;

    const skip = (page - 1) * limit;
    const total = await this.model.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    const queryBuilder = this.model.find(filter);
    queryBuilder.skip(skip);
    queryBuilder.limit(limit);
    queryBuilder.sort(sort);

    if (select) {
      queryBuilder.select(select);
    }

    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach(pop => queryBuilder.populate(pop as any));
      } else {
        queryBuilder.populate(populate as any);
      }
    }

    const data = await queryBuilder.lean().exec() as T[];

    return {
      data,
      total,
      page,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
      limit
    };
  }

  async count(filter: Record<string, any> = {}): Promise<number> {
    return await this.model.countDocuments(filter).exec();
  }

  async exists(filter: Record<string, any>): Promise<boolean> {
    const count = await this.model.countDocuments(filter).limit(1).exec();
    return count > 0;
  }

  async insertMany(data: Partial<T>[]): Promise<T[]> {
    return await this.model.insertMany(data) as unknown as T[];
  }

  async findByIds(ids: (Schema.Types.ObjectId | string)[]): Promise<T[]> {
    return await this.model.find({ _id: { $in: ids } }).exec();
  }

  async findWithSort(filter: Record<string, any>, sort: Record<string, 1 | -1>): Promise<T[]> {
    return await this.model.find(filter).sort(sort).exec();
  }

  async findWithLimit(filter: Record<string, any>, limit: number): Promise<T[]> {
    return await this.model.find(filter).limit(limit).exec();
  }
}
