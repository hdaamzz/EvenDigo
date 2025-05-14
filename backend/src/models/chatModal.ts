// import mongoose, { Schema } from 'mongoose';
// import { IChatDocument } from './interfaces/message.interface';

// const chatSchema = new Schema(
//   {
//     name: { type: String, trim: true },
//     isGroupChat: { type: Boolean, default: false },
//     users: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true,
//         ref: 'User',
//       },
//     ],
//     latestMessage: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Message',
//     },
//     groupAdmin: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//     },
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// export const getChatModel = (connection: mongoose.Connection) => {
//   return connection.model<IChatDocument>('Chat', chatSchema);
// };
