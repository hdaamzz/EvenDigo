import { Schema } from "mongoose";
import { VerificationModel } from "../../src/models/VerificationModel";
import { IVerificationRepository } from "./interfaces/IVerification.repository";
import { injectable } from "tsyringe";
import { IVerification } from "src/models/interfaces/profile.interface";

@injectable()
export class VerificationRepository implements IVerificationRepository{

  async findAllVerificationUsers(): Promise<IVerification[]> {
    return VerificationModel.find({})
      .sort({ createdAt: -1 })
      .populate('user_id');
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
      {user_id:userId}, 
      { $set: { status: "Rejected" } },
      { new: true }
    );
  }
    async createVerificationRequest(data:{}): Promise<IVerification | null> {
          try {
              const newRequest = new VerificationModel(data);
              const savedRequest = await newRequest.save();
              return savedRequest;
          } catch (error: unknown) {
              console.error("Error while creating varefication request", error);
              throw new Error('Failed to create varefication request');
          }
      }
  
      
      async getVerificationRequest(user_id:Schema.Types.ObjectId | string): Promise<IVerification | null> {
          try {
              return VerificationModel.findOne({user_id})
          } catch (error: unknown) {
              console.error("Error while creating varefication request", error);
              throw new Error('Failed to create varefication request');
          }
      }
  

}