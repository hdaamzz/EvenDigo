import { Schema, Document } from 'mongoose';

export interface IPaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  select?: string;
  populate?: string | string[] | Record<string, any> | Record<string, any>[];
}

export interface IBaseRepository<T extends Document> {
  create(data: Partial<T>): Promise<T>;
  findById(id: Schema.Types.ObjectId | string): Promise<T | null>;
  findOne(filter: Record<string, any>): Promise<T | null>;
  findAll(filter?: Record<string, any>): Promise<T[]>;
  updateById(id: Schema.Types.ObjectId | string, updateData: Partial<T>): Promise<T | null>;
  updateOne(filter: Record<string, any>, updateData: Partial<T>): Promise<T | null>;
  updateMany(filter: Record<string, any>, updateData: Partial<T>): Promise<{ modifiedCount: number; success: boolean }>;
  deleteById(id: Schema.Types.ObjectId | string): Promise<boolean>;
  deleteOne(filter: Record<string, any>): Promise<boolean>;
  deleteMany(filter: Record<string, any>): Promise<{ deletedCount: number; success: boolean }>;
  
  findWithPagination(
    filter: Record<string, any>,
    options: IPaginationOptions
  ): Promise<IPaginationResult<T>>;
  count(filter?: Record<string, any>): Promise<number>;
  
  exists(filter: Record<string, any>): Promise<boolean>;
  
  insertMany(data: Partial<T>[]): Promise<T[]>;
  
  findByIds(ids: (Schema.Types.ObjectId | string)[]): Promise<T[]>;
  findWithSort(filter: Record<string, any>, sort: Record<string, 1 | -1>): Promise<T[]>;
  findWithLimit(filter: Record<string, any>, limit: number): Promise<T[]>;
}