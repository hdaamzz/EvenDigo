import mongoose, { Schema, Document } from 'mongoose';

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

const MessageSchema = new Schema<IMessage>({
  chatId: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
  messageType: {
    type: String,
    enum: ['text', 'system', 'image', 'file'],
    default: 'text'
  }
}, {
  timestamps: true
});

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

const ChatSchema = new Schema<IChat>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    content: String,
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date,
    messageType: {
      type: String,
      default: 'text'
    }
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  messageCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  chatType: {
    type: String,
    enum: ['personal', 'group'],
    default: 'personal',
    required: true
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: function() { return this.chatType === 'group'; }
  },
  name: {
    type: String,
    required: function() { return this.chatType === 'group'; }
  }
}, {
  timestamps: true
});

ChatSchema.pre('save', function(next) {
  if (this.chatType === 'personal' && this.participants.length !== 2) {
    return next(new Error('Personal chat must have exactly 2 participants'));
  }
  if (this.chatType === 'group' && !this.eventId) {
    return next(new Error('Group chat must be associated with an event'));
  }
  next();
  next();
});

export const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);
export const ChatModel = mongoose.model<IChat>('Chat', ChatSchema);