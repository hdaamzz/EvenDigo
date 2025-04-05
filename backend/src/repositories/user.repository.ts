import { UserModel } from "../models/UserModel";
import { IUser } from "../models/interfaces/auth.interface";
import { MongoError } from 'mongodb';
import { Schema } from "mongoose";
import { IUserRepository } from "./interfaces/IUser.repository";
import { injectable } from "tsyringe";


@injectable()
export class UserRepository implements IUserRepository {


    async findByIdWithoutPassword(id: Schema.Types.ObjectId | string): Promise<IUser | null> {
        return UserModel.findById({ id }, { password: 0 });
    }

    async createUser(userData: IUser): Promise<IUser> {
        try {
            const user = new UserModel(userData);
            const savedUser = await user.save();
            return savedUser;
        } catch (error: unknown) {
            if (error instanceof MongoError && (error as any).code === 11000) {
                throw new Error('Email already exists');
            }
            console.error("Error while creating user:", error);
            throw new Error('Failed to create user');
        }
    }


    async findUserById(id: Schema.Types.ObjectId | string): Promise<IUser | null> {
        return UserModel.findById(id);
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
        return UserModel.find({ role: 'user' })
    }

    async blockUserById(userId: Schema.Types.ObjectId | string): Promise<any> {
        return UserModel.findByIdAndUpdate(
            userId,
            { $set: { status: "blocked" } },
            { new: true }
        );
    }
    async unblockUserById(userId: Schema.Types.ObjectId | string): Promise<any> {
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