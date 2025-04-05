import { Document, Schema, model } from "mongoose";

import { IUser } from "./interfaces/auth.interface";

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        optional: true,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        optional: true
    },
    role: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        optional: true,
        trim: true
    },
    firebaseUid:{
        type:String,
        optional:true
    },
    profileImg: {
        type: String,
        optional: true,
    },
    location: {
        type: String,
        optional: true,
    },
    bio: {
        type: String,
        optional: true,
    },
    gender: {
        type: String,
        optional: true,
        enum: ['Male', 'Female']
    },
    status: {
        type: String,
        required: true
    },
    lastLogin:{
        type:Date,
        optional:true
    },
    provider:{
        type:String,
        optional:true
    },
    verified:{
        type:Boolean,
        optional:true
    },
    profileImgPublicId:{
        type:String,
        optional:true
    }

}, {
    timestamps: true,
}
);

export const UserModel = model<IUser & Document>('User',userSchema)