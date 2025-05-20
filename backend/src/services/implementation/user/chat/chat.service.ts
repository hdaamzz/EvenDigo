import { Types } from "mongoose";
import ChatModel, { IChat, IMessage } from "../../../../../src/models/ChatModel";
import { IChatService } from "../../../../../src/services/interfaces/user/chat/IChat.service";
import { injectable } from "tsyringe";


@injectable()
export class ChatService implements IChatService {
  async createChat(participantIds: string[]): Promise<IChat> {
    if (participantIds.length < 2) {
      throw new Error('A chat requires at least 2 participants');
    }

    const participantObjectIds = participantIds.map(id => new Types.ObjectId(id));

    const existingChat = await ChatModel.findOne({
      participants: { $all: participantObjectIds },
      $expr: { $eq: [{ $size: '$participants' }, participantIds.length] }
    });

    if (existingChat) {
      return existingChat;
    }

    // Create a new chat
    const newChat = new ChatModel({
      participants: participantObjectIds,
      messages: []
    });

    await newChat.save();
    return newChat;
  }

  async getChatById(chatId: string): Promise<IChat> {
    const chat = await ChatModel.findById(chatId)
      .populate('participants', 'username profileImage')
      .populate('messages.sender', 'username profileImage');
    
    if (!chat) {
      throw new Error('Chat not found');
    }
    
    return chat;
  }

  async getUserChats(userId: string): Promise<IChat[]> {
    const userObjectId = new Types.ObjectId(userId);
    
    // Find all chats where the user is a participant
    const chats = await ChatModel.find({ participants: userObjectId })
      .populate('participants', 'username profileImage')
      .populate('lastMessage.sender', 'username profileImage')
      .sort({ updatedAt: -1 });
    
    return chats;
  }

  async getChatMessages(chatId: string, limit: number = 50, skip: number = 0): Promise<IMessage[]> {
    const chat = await ChatModel.findById(chatId)
      .populate('messages.sender', 'username profileImage')
      .select('messages')
      .slice('messages', [skip, limit]);
    
    if (!chat) {
      throw new Error('Chat not found');
    }
    
    return chat.messages;
  }

  async addMessage(chatId: string, senderId: string, content: string): Promise<IMessage> {
    const senderObjectId = new Types.ObjectId(senderId);
    
    const newMessage = {
      sender: senderObjectId,
      content,
      timestamp: new Date(),
      read: false
    };
    
    const chat = await ChatModel.findByIdAndUpdate(
      chatId,
      { 
        $push: { messages: newMessage },
        $set: { lastMessage: newMessage }
      },
      { new: true }
    ).populate('messages.sender', 'username profileImage');
    
    if (!chat) {
      throw new Error('Chat not found');
    }
    
    // Return the newly added message
    return chat.messages[chat.messages.length - 1];
  }

  async getChatBetweenUsers(userOneId: string, userTwoId: string): Promise<IChat | null> {
    const userOneObjectId = new Types.ObjectId(userOneId);
    const userTwoObjectId = new Types.ObjectId(userTwoId);
    
    const chat = await ChatModel.findOne({
      participants: { $all: [userOneObjectId, userTwoObjectId] },
      $expr: { $eq: [{ $size: '$participants' }, 2] }
    })
    .populate('participants', 'username profileImage')
    .populate('lastMessage.sender', 'username profileImage');
    
    return chat;
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
    
    const chats = await ChatModel.find({ participants: userObjectId });
    
    let unreadCount = 0;
    
    for (const chat of chats) {
      for (const message of chat.messages) {
        if (!message.read && !message.sender.equals(userObjectId)) {
          unreadCount++;
        }
      }
    }
    
    return unreadCount;
  }

  async deleteChat(chatId: string): Promise<void> {
    const result = await ChatModel.deleteOne({ _id: chatId });
    
    if (result.deletedCount === 0) {
      throw new Error('Chat not found');
    }
  }
}