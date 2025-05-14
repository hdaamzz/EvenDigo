// import mongoose, { Schema } from 'mongoose';
// import { IMessageDocument } from './interfaces/message.interface';

// const messageSchema = new Schema(
//   {
//     sender: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       ref: 'User',
//     },
//     content: { type: String, trim: true },
//     mediaUrl: { type: String, default: null },
//     type: {
//       type: String,
//       enum: ['text', 'image', 'video'],
//       default: 'text',
//     },
//     chat: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Chat',
//     },
//     isRead: { type: Boolean, default: false },
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// export const getMessageModel = mongoose.model<IMessageDocument>(
//   'Message',
//   messageSchema
// );
