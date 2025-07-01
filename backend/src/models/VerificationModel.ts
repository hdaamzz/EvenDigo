import { Document, Schema, model } from "mongoose";
import { IVerification } from "./interfaces/profile.interface";

const verificationSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Verified", "Rejected", "Pending"],
      default:'Pending'
    },
    note: {
      type: String,
      optional: true,
    },
  },
  {
    timestamps: true,
  }
);

export const VerificationModel = model<IVerification & Document>(
  "Verification",
  verificationSchema
);
