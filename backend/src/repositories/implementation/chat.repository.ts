import { Types } from "mongoose";
import { injectable } from "tsyringe";
import { IChatRepository } from "../interfaces/IChat.repository";
import ChatModel, { IChat, IMessage } from "../../../src/models/ChatModel";

@injectable()
export class ChatRepository implements IChatRepository {
  
  async createChat(participantIds: string[], chatType: 'personal' | 'event', eventId?: string): Promise<IChat> {
    if (participantIds.length < 2 && chatType === 'personal') {
      throw new Error('A personal chat requires at least 2 participants');
    }

    const participantObjectIds = participantIds.map(id => new Types.ObjectId(id));

    // For personal chats, check if chat already exists between users
    if (chatType === 'personal') {
      const existingChat = await ChatModel.findOne({
        participants: { $all: participantObjectIds },
        chatType: 'personal',
        $expr: { $eq: [{ $size: '$participants' }, participantIds.length] }
      });

      if (existingChat) {
        return existingChat;
      }
    }

    // For event chats, check if event chat already exists
    if (chatType === 'event' && eventId) {
      const existingEventChat = await ChatModel.findOne({
        eventId: new Types.ObjectId(eventId),
        chatType: 'event'
      });

      if (existingEventChat) {
        return existingEventChat;
      }
    }

    const chatData: any = {
      participants: participantObjectIds,
      messages: [],
      chatType,
      isActive: true
    };

    if (chatType === 'event' && eventId) {
      chatData.eventId = new Types.ObjectId(eventId);
    }

    const newChat = new ChatModel(chatData);
    await newChat.save();
    return newChat;
  }

  async getChatById(chatId: string): Promise<IChat | null> {
    const chat = await ChatModel.findById(chatId)
      .populate('participants', 'username profileImage email')
      .populate('messages.sender', 'username profileImage')
      .populate('eventId', 'title description startDate');
    
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
      .populate('eventId', 'title description startDate')
      .sort({ updatedAt: -1 });
    
    return chats;
  }

  async getChatMessages(chatId: string, limit: number = 50, skip: number = 0): Promise<IMessage[]> {
    const chat = await ChatModel.findById(chatId)
      .populate('messages.sender', 'username profileImage')
      .select('messages')
      .slice('messages', [-limit - skip, -skip]);
    
    if (!chat) {
      throw new Error('Chat not found');
    }
    
    return chat.messages.reverse(); // Return in chronological order
  }

  async addMessage(chatId: string, senderId: string, content: string): Promise<IMessage> {
    const senderObjectId = new Types.ObjectId(senderId);
    
    const newMessage = {
      sender: senderObjectId,
      content,
      timestamp: new Date(),
      read: false,
      messageType: 'text' as const
    };
    
    const chat = await ChatModel.findByIdAndUpdate(
      chatId,
      { 
        $push: { messages: newMessage },
        $set: { 
          lastMessage: newMessage,
          updatedAt: new Date()
        }
      },
      { new: true }
    ).populate('messages.sender', 'username profileImage');
    
    if (!chat) {
      throw new Error('Chat not found');
    }
    
    return chat.messages[chat.messages.length - 1];
  }

  async getChatBetweenUsers(userOneId: string, userTwoId: string): Promise<IChat | null> {
    const userOneObjectId = new Types.ObjectId(userOneId);
    const userTwoObjectId = new Types.ObjectId(userTwoId);
    
    const chat = await ChatModel.findOne({
      participants: { $all: [userOneObjectId, userTwoObjectId] },
      chatType: 'personal',
      isActive: true,
      $expr: { $eq: [{ $size: '$participants' }, 2] }
    })
    .populate('participants', 'username profileImage email')
    .populate('lastMessage.sender', 'username profileImage');
    
    return chat;
  }

  async getEventChat(eventId: string): Promise<IChat | null> {
    const chat = await ChatModel.findOne({
      eventId: new Types.ObjectId(eventId),
      chatType: 'event',
      isActive: true
    })
    .populate('participants', 'username profileImage email')
    .populate('lastMessage.sender', 'username profileImage')
    .populate('eventId', 'title description startDate');
    
    return chat;
  }

  async addParticipantToEventChat(eventId: string, userId: string): Promise<IChat | null> {
    const userObjectId = new Types.ObjectId(userId);
    const eventObjectId = new Types.ObjectId(eventId);

    const chat = await ChatModel.findOneAndUpdate(
      { 
        eventId: eventObjectId,
        chatType: 'event',
        participants: { $ne: userObjectId }
      },
      { 
        $addToSet: { participants: userObjectId }
      },
      { new: true }
    )
    .populate('participants', 'username profileImage email')
    .populate('eventId', 'title description startDate');

    return chat;
  }

  async removeParticipantFromEventChat(eventId: string, userId: string): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);
    const eventObjectId = new Types.ObjectId(eventId);

    await ChatModel.updateOne(
      { 
        eventId: eventObjectId,
        chatType: 'event'
      },
      { 
        $pull: { participants: userObjectId }
      }
    );
  }

  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);
    
    await ChatModel.updateOne(
      { _id: chatId },
      { 
        $set: { 
          'messages.$[elem].read': true 
        } 
      },
      { 
        arrayFilters: [
          { 'elem.sender': { $ne: userObjectId }, 'elem.read': false }
        ]
      }
    );
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const userObjectId = new Types.ObjectId(userId);
    
    const result = await ChatModel.aggregate([
      { $match: { participants: userObjectId, isActive: true } },
      { $unwind: '$messages' },
      { 
        $match: { 
          'messages.read': false,
          'messages.sender': { $ne: userObjectId }
        }
      },
      { $count: 'unreadCount' }
    ]);
    
    return result.length > 0 ? result[0].unreadCount : 0;
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
}