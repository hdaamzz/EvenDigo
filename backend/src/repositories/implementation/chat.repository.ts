import { Types } from "mongoose";
import { injectable } from "tsyringe";
import { IChatRepository } from "../interfaces/IChat.repository";
import { ChatModel, MessageModel, IChat, IMessage } from "../../../src/models/ChatModel";

@injectable()
export class ChatRepository implements IChatRepository {

    async createChat(participantIds: string[]): Promise<IChat> {
        if (participantIds.length !== 2) {
            throw new Error('A personal chat requires exactly 2 participants');
        }

        const participantObjectIds = participantIds.map(id => new Types.ObjectId(id));

        // Check if chat already exists between these users
        const existingChat = await ChatModel.findOne({
            participants: { $all: participantObjectIds },
            isActive: true,
            $expr: { $eq: [{ $size: '$participants' }, 2] }
        });

        if (existingChat) {
            return existingChat;
        }

        const chatData = {
            participants: participantObjectIds,
            isActive: true,
            messageCount: 0
        };

        const newChat = new ChatModel(chatData);
        await newChat.save();
        return newChat;
    }

    async getChatById(chatId: string): Promise<IChat | null> {
        const chat = await ChatModel.findById(chatId)
            .populate('participants', 'username profileImage email')
            .populate('lastMessage.sender', 'username profileImage');

        return chat;
    }

    async getUserChats(userId: string): Promise<IChat[]> {
        const userObjectId = new Types.ObjectId(userId);

        const chats = await ChatModel.find({
            participants: userObjectId,
            isActive: true
        })
            .populate('participants', 'username profileImage email')
            .populate('lastMessage.sender', 'username profileImage')
            .sort({ lastMessageAt: -1 });

        return chats;
    }

    async getChatMessages(chatId: string, limit: number = 50, skip: number = 0): Promise<IMessage[]> {
        const messages = await MessageModel.find({ 
            chatId: new Types.ObjectId(chatId) 
        })
            .populate('sender', 'username profileImage')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);

        // Return in ascending order (oldest first)
        return messages.reverse();
    }

    async addMessage(chatId: string, senderId: string, content: string, messageType: 'text' | 'system' | 'image' | 'file' = 'text'): Promise<IMessage> {
        const chatObjectId = new Types.ObjectId(chatId);
        const senderObjectId = new Types.ObjectId(senderId);

        // Create the message
        const newMessage = new MessageModel({
            chatId: chatObjectId,
            sender: senderObjectId,
            content,
            timestamp: new Date(),
            read: false,
            messageType
        });

        await newMessage.save();

        // Update chat's last message and message count
        await ChatModel.findByIdAndUpdate(
            chatId,
            {
                $set: {
                    lastMessage: {
                        content: content,
                        sender: senderObjectId,
                        timestamp: newMessage.timestamp,
                        messageType: messageType
                    },
                    lastMessageAt: newMessage.timestamp
                },
                $inc: { messageCount: 1 }
            }
        );

        // Populate sender info before returning
        await newMessage.populate('sender', 'username profileImage');
        
        return newMessage;
    }

    async getChatBetweenUsers(userOneId: string, userTwoId: string): Promise<IChat | null> {
        const userOneObjectId = new Types.ObjectId(userOneId);
        const userTwoObjectId = new Types.ObjectId(userTwoId);

        const chat = await ChatModel.findOne({
            participants: { $all: [userOneObjectId, userTwoObjectId] },
            isActive: true,
            $expr: { $eq: [{ $size: '$participants' }, 2] }
        })
            .populate('participants', 'username profileImage email')
            .populate('lastMessage.sender', 'username profileImage');

        return chat;
    }

    async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
        const userObjectId = new Types.ObjectId(userId);
        const chatObjectId = new Types.ObjectId(chatId);

        await MessageModel.updateMany(
            { 
                chatId: chatObjectId,
                sender: { $ne: userObjectId },
                read: false 
            },
            { 
                $set: { read: true } 
            }
        );
    }

    async getUnreadMessageCount(userId: string): Promise<number> {
        const userObjectId = new Types.ObjectId(userId);

        // Get all chats where user is a participant
        const userChats = await ChatModel.find({
            participants: userObjectId,
            isActive: true
        }).select('_id');

        const chatIds = userChats.map(chat => chat._id);

        // Count unread messages in those chats (excluding messages sent by the user)
        const unreadCount = await MessageModel.countDocuments({
            chatId: { $in: chatIds },
            sender: { $ne: userObjectId },
            read: false
        });

        return unreadCount;
    }

    async deleteChat(chatId: string): Promise<void> {
        const result = await ChatModel.updateOne(
            { _id: chatId },
            { $set: { isActive: false } }
        );

        if (result.matchedCount === 0) {
            throw new Error('Chat not found');
        }
    }

    async getChatMessagesWithPagination(chatId: string, page: number = 1, limit: number = 50): Promise<{
        messages: IMessage[];
        totalMessages: number;
        totalPages: number;
        currentPage: number;
        hasNext: boolean;
        hasPrev: boolean;
    }> {
        const chatObjectId = new Types.ObjectId(chatId);
        const skip = (page - 1) * limit;

        const [messages, totalMessages] = await Promise.all([
            MessageModel.find({ chatId: chatObjectId })
                .populate('sender', 'username profileImage')
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit),
            MessageModel.countDocuments({ chatId: chatObjectId })
        ]);

        const totalPages = Math.ceil(totalMessages / limit);

        return {
            messages: messages.reverse(), 
            totalMessages,
            totalPages,
            currentPage: page,
            hasNext: page < totalPages,
            hasPrev: page > 1
        };
    }

    async getMessageById(messageId: string): Promise<IMessage | null> {
        return await MessageModel.findById(messageId)
            .populate('sender', 'username profileImage');
    }

    async updateMessage(messageId: string, content: string): Promise<IMessage | null> {
        return await MessageModel.findByIdAndUpdate(
            messageId,
            { 
                $set: { 
                    content,
                    updatedAt: new Date()
                } 
            },
            { new: true }
        ).populate('sender', 'username profileImage');
    }

    async deleteMessage(messageId: string): Promise<void> {
        await MessageModel.findByIdAndDelete(messageId);
    }
}