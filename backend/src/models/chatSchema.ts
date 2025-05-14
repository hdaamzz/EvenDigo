import { Schema, model } from 'mongoose';


interface IChat {
  participants: string[];
  createdAt: Date;
}

const ChatSchema = new Schema<IChat>({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  createdAt: { type: Date, default: Date.now },
});

interface IGroupChat {
  eventId: Schema.Types.ObjectId |  string;
  members: string[];
  createdAt: Date;
}

const GroupChatSchema = new Schema<IGroupChat>({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  createdAt: { type: Date, default: Date.now },
});

interface IMessage {
  chatId?: string; 
  groupChatId?: string; 
  senderId:  Schema.Types.ObjectId | string;
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: false },
  groupChatId: { type: Schema.Types.ObjectId, ref: 'GroupChat', required: false },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Chat = model<IChat>('Chat', ChatSchema);
export const GroupChat = model<IGroupChat>('GroupChat', GroupChatSchema);
export const Message = model<IMessage>('Message', MessageSchema);