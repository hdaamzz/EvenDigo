import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
  read: boolean;
  messageType?: 'text' | 'system' | 'image' | 'file';
}

export interface IChat extends Document {
  _id:mongoose.Types.ObjectId | string
  participants: mongoose.Types.ObjectId[];
  messages: IMessage[];
  chatType: 'personal' | 'event';
  eventId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: IMessage;
  isActive: boolean;
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
  },
  messageType: {
    type: String,
    enum: ['text', 'system', 'image', 'file'],
    default: 'text'
  }
});

const ChatSchema = new Schema<IChat>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [MessageSchema],
  chatType: {
    type: String,
    enum: ['personal', 'event'],
    required: true,
    default: 'personal'
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: function(this: IChat) {
      return this.chatType === 'event';
    }
  },
  lastMessage: {
    type: MessageSchema,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
// ChatSchema.index({ participants: 1 });
// ChatSchema.index({ eventId: 1, chatType: 1 });
// ChatSchema.index({ chatType: 1 });
// ChatSchema.index({ updatedAt: -1 });

export default mongoose.model<IChat>('Chat', ChatSchema);