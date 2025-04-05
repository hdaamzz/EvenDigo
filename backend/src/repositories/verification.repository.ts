import { Schema } from "mongoose";
import { VerificationModel } from "../../src/models/VerificationModel";
import { IVerificationRepository } from "./interfaces/IVerification.repository";
import { injectable } from "tsyringe";

@injectable()
export class VerificationRepository implements IVerificationRepository{

  async findAllVerificationUsers(): Promise<any> {
    return VerificationModel.find({}).populate('user_id')
  }

  
  async approveUser(userId: Schema.Types.ObjectId | string): Promise<any> {    
    return VerificationModel.updateOne(
      {user_id:userId}, 
      { $set: { status: "Verified" } },
      { new: true }
    );
  }

  async rejectUser(userId: Schema.Types.ObjectId | string): Promise<any> {
    return VerificationModel.updateOne(
      {user_id:userId}, 
      { $set: { status: "Rejected" } },
      { new: true }
    );
  }
    async createVerificationRequest(data:{}): Promise<any> {
          try {
              const newRequest = new VerificationModel(data);
              const savedRequest = await newRequest.save();
              return savedRequest;
          } catch (error: unknown) {
              console.error("Error while creating varefication request", error);
              throw new Error('Failed to create varefication request');
          }
      }
  
      
      async getVerificationRequest(user_id:Schema.Types.ObjectId | string): Promise<any> {
          try {
              return VerificationModel.findOne({user_id})
          } catch (error: unknown) {
              console.error("Error while creating varefication request", error);
              throw new Error('Failed to create varefication request');
          }
      }
  

}