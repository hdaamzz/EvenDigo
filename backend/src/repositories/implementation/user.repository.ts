import { Schema } from "mongoose";
import { injectable } from "tsyringe";
import { MongoError } from 'mongodb';
import { UserModel } from "../../models/UserModel";
import { IUser } from "../../models/interfaces/auth.interface";
import { IUserRepository } from "../interfaces/IUser.repository";
import { BaseRepository } from "../BaseRepository";

@injectable()
export class UserRepository extends BaseRepository<IUser> implements IUserRepository {

    constructor() {
        super(UserModel);
    }

    async findUserByIdWithoutPassword(userId: Schema.Types.ObjectId | string): Promise<IUser | null> {
        return this.model.findById(userId, { password: 0 }).exec();
    }

    async findUserByEmail(email: string): Promise<IUser | null> {
        return this.findOne({ email });
    }

    async updateUserLastLogin(userId: Schema.Types.ObjectId | string): Promise<void> {
        await this.model.findByIdAndUpdate(userId, {
            lastLogin: new Date()
        }).exec();
    }

    async blockUserById(userId: Schema.Types.ObjectId | string): Promise<IUser | null> {
        return this.updateById(userId, { status: "blocked" } as Partial<IUser>);
    }

    async unblockUserById(userId: Schema.Types.ObjectId | string): Promise<IUser | null> {
        return this.updateById(userId, { status: "active" } as Partial<IUser>);
    }

    async approveUserStatusChange(userId: Schema.Types.ObjectId | string): Promise<void> {
        await this.updateById(userId, { verified: true } as Partial<IUser>);
    }

    async findAllActiveUsers(): Promise<IUser[]> {
        return this.findWithSort({ role: 'user' }, { createdAt: -1 });
    }

    async searchUsers(searchTerm: string): Promise<IUser[]> {
        const searchRegex = new RegExp(searchTerm, 'i'); 
        
        return this.model.find({
            role: 'user',
            $or: [
                { name: { $regex: searchRegex } },
                { email: { $regex: searchRegex } },
                { phone: { $regex: searchRegex } },
                { status: { $regex: searchRegex } },
                { gender: { $regex: searchRegex } }
            ]
        })
        .select('-password -firebaseUid')
        .sort({ createdAt: -1 })
        .exec();
    }

    async createUser(userData: IUser): Promise<IUser> {
        try {
            return await this.create(userData);
        } catch (error: unknown) {
            if (error instanceof MongoError && (error as any).code === 11000) {
                throw new Error('Email already exists');
            }
            console.error("Error while creating user:", error);
            throw new Error('Failed to create user');
        }
    }

    async findUsersByRole(role: string, page: number = 1, limit: number = 10): Promise<any> {
        return this.findWithPagination(
            { role },
            { page, limit, sort: { createdAt: -1 } }
        );
    }

    async findActiveUsers(): Promise<IUser[]> {
        return this.findAll({ status: 'active' });
    }

    async findBlockedUsers(): Promise<IUser[]> {
        return this.findAll({ status: 'blocked' });
    }

    async findUnverifiedUsers(): Promise<IUser[]> {
        return this.findAll({ verified: false });
    }
}