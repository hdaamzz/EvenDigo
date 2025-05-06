import { UserModel } from "../../models/UserModel";
import { MongoError } from 'mongodb';
import { Schema } from "mongoose";
import { injectable } from "tsyringe";
import { IUser } from "../../../src/models/interfaces/auth.interface";
import { IUserRepository } from "../interfaces/IUser.repository";


@injectable()
export class UserRepository implements IUserRepository {


    async findUserByIdWithoutPassword(userId: Schema.Types.ObjectId | string): Promise<IUser | null> {
        return UserModel.findById({ userId }, { password: 0 });
    }

    async createUser(userData: IUser): Promise<IUser> {
        try {
            const user = new UserModel(userData);
            const savedUser = await user.save();
            return savedUser;
        } catch (error: unknown) {
            if (error instanceof MongoError && (error).code === 11000) {
                throw new Error('Email already exists');
            }
            console.error("Error while creating user:", error);
            throw new Error('Failed to create user');
        }
    }


    async findUserById(userId: Schema.Types.ObjectId | string): Promise<IUser | null> {
        return UserModel.findById(userId);
    }


    async findUserByEmail(email: string): Promise<IUser | null> {
        return UserModel.findOne({ email });
    }

    async updateUserLastLogin(userId: Schema.Types.ObjectId | string): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, {
            lastLogin: new Date()
        });
    }
    async updateUser(userId: Schema.Types.ObjectId | string, updateData: Partial<IUser>): Promise<IUser | null> {
        return UserModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        );
    }


    async findAllUsers(): Promise<IUser[]> {
        return UserModel.find({ role: 'user' }).sort({ createdAt: -1 })
    }

    async blockUserById(userId: Schema.Types.ObjectId | string): Promise<IUser | null> {
        return UserModel.findByIdAndUpdate(
            userId,
            { $set: { status: "blocked" } },
            { new: true }
        );
    }
    async unblockUserById(userId: Schema.Types.ObjectId | string): Promise<IUser | null> {
        return UserModel.findByIdAndUpdate(
            userId,
            { $set: { status: "active" } },
            { new: true }
        );
    }

    async approveUserStatusChange(userId: Schema.Types.ObjectId | string): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, { $set: { verified: true } }, { new: true });
    }
}