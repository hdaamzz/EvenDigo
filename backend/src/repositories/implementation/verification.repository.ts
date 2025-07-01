import { Schema } from "mongoose";
import { VerificationModel } from "../../models/VerificationModel";
import { IVerificationRepository } from "../interfaces/IVerification.repository";
import { injectable } from "tsyringe";
import { IVerification } from "../../models/interfaces/profile.interface";

@injectable()
export class VerificationRepository implements IVerificationRepository {

  async findAllVerificationUsers(): Promise<IVerification[]> {
    return VerificationModel.find({})
      .sort({ createdAt: -1 })
      .populate('user_id', '-password -firebaseUid');
  }

  async searchVerificationUsers(searchTerm: string): Promise<any[]> {
    const searchRegex = new RegExp(searchTerm, 'i');
    
    return VerificationModel.find({
      status: { $regex: searchRegex }
    })
    .sort({ createdAt: -1 })
    .populate({
      path: 'user_id',
      select: '-password -firebaseUid'
    });
  }

  async approveUser(userId: Schema.Types.ObjectId | string): Promise<IVerification | null> {
    return VerificationModel.findOneAndUpdate(
      { user_id: userId },
      { $set: { status: "Verified" } },
      { new: true }
    );
  }

  async rejectUser(userId: Schema.Types.ObjectId | string): Promise<IVerification | null> {
    return VerificationModel.findOneAndUpdate(
      { user_id: userId },
      { $set: { status: "Rejected" } },
      { new: true }
    );
  }

  async createVerificationRequest(data: {}): Promise<IVerification | null> {
    try {
      const newRequest = new VerificationModel(data);
      const savedRequest = await newRequest.save();
      return savedRequest;
    } catch (error: unknown) {
      console.error("Error while creating verification request", error);
      throw new Error('Failed to create verification request');
    }
  }

  async getVerificationRequest(user_id: Schema.Types.ObjectId | string): Promise<IVerification | null> {
    try {
      return VerificationModel.findOne({ user_id })
    } catch (error: unknown) {
      console.error("Error while getting verification request", error);
      throw new Error('Failed to get verification request');
    }
  }
}