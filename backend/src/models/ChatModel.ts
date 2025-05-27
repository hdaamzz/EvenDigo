import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: IMessage;
}

const MessageSchema = new Schema<IMessage>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
});

const ChatSchema = new Schema<IChat>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [MessageSchema],
  lastMessage: {
    type: MessageSchema,
    default: null
  }
}, {
  timestamps: true
});

ChatSchema.index({ participants: 1 });

export default mongoose.model<IChat>('Chat', ChatSchema);