import mongoose, { Document } from "mongoose";

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  chatId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
  read: boolean;
  messageType: 'text' | 'system' | 'image' | 'file';
  createdAt: Date;
  updatedAt: Date;
}

export interface IChat extends Document {
  _id: mongoose.Types.ObjectId | string;
  participants: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: {
    content: string;
    sender: mongoose.Types.ObjectId;
    timestamp: Date;
    messageType: string;
  };
  lastMessageAt?: Date;
  messageCount: number;
  isActive: boolean;
  chatType: 'personal' | 'group';
  eventId?: mongoose.Types.ObjectId;
  name?: string;
}