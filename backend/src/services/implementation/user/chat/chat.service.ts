import { IUserRepository } from "src/repositories/interfaces/IUser.repository";
import { IChat, IMessage } from "../../../../models/interfaces/chat.interface";
import { IChatRepository } from "../../../../repositories/interfaces/IChat.repository";
import { IChatService } from "../../../interfaces/user/chat/IChat.service";
import { inject, injectable } from "tsyringe";

@injectable()
export class ChatService implements IChatService {
  constructor(
    @inject('ChatRepository') private chatRepository: IChatRepository,
    @inject('UserRepository') private userRepository:IUserRepository
  ) {}

  async createPersonalChat(participantIds: string[]): Promise<IChat> {
    if (participantIds.length !== 2) {
      throw new Error('Personal chat requires exactly 2 participants');
    }

    let user=await this.userRepository.findById(participantIds[1]);
    
    return await this.chatRepository.createChat(participantIds, 'personal','','',user?.name,user?.profileImg);
  }

  async createGroupChat(eventId: string, name: string, participantIds: string[]): Promise<IChat> {
    if (!eventId || !name) {
      throw new Error('Event ID and name are required for group chat');
    }
    
    return await this.chatRepository.createChat(participantIds, 'group', eventId, name);
  }

  async addParticipantToGroupChat(chatId: string, userId: string): Promise<IChat> {
    return await this.chatRepository.addParticipantToGroupChat(chatId, userId);
  }

  async getChatById(chatId: string): Promise<IChat> {
    if (!chatId) {
      throw new Error('Chat ID is required');
    }

    const chat = await this.chatRepository.getChatById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }
    return chat;
  }

  async getUserChats(userId: string): Promise<IChat[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return await this.chatRepository.getUserChats(userId);
  }

  async getChatMessages(chatId: string, limit: number = 50, skip: number = 0): Promise<IMessage[]> {
    if (!chatId) {
      throw new Error('Chat ID is required');
    }

    return await this.chatRepository.getChatMessages(chatId, limit, skip);
  }

  async getChatMessagesWithPagination(chatId: string, page: number = 1, limit: number = 50): Promise<{
    messages: IMessage[];
    totalMessages: number;
    totalPages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    if (!chatId) {
      throw new Error('Chat ID is required');
    }

    if (page < 1) {
      throw new Error('Page number must be greater than 0');
    }

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    return await this.chatRepository.getChatMessagesWithPagination(chatId, page, limit);
  }

  async addMessage(chatId: string, senderId: string, content: string, messageType: 'text' | 'system' | 'image' | 'file' = 'text'): Promise<IMessage> {
    if (!chatId || !senderId) {
      throw new Error('Chat ID and Sender ID are required');
    }

    if (!content || !content.trim()) {
      throw new Error('Message content cannot be empty');
    }
    
    const hasAccess = await this.validateChatAccess(chatId, senderId);
    if (!hasAccess) {
      throw new Error('User does not have access to this chat');
    }
    
    return await this.chatRepository.addMessage(chatId, senderId, content.trim(), messageType);
  }

  async getChatBetweenUsers(userOneId: string, userTwoId: string): Promise<IChat | null> {
    if (!userOneId || !userTwoId) {
      throw new Error('Both user IDs are required');
    }

    if (userOneId === userTwoId) {
      throw new Error('Cannot create chat with the same user');
    }

    return await this.chatRepository.getChatBetweenUsers(userOneId, userTwoId);
  }

  async getGroupChatByEventId(eventId: string): Promise<IChat | null> {
    if (!eventId) {
      throw new Error('Event ID is required');
    }

    return await this.chatRepository.getGroupChatByEventId(eventId);
  }

  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    if (!chatId || !userId) {
      throw new Error('Chat ID and User ID are required');
    }

    await this.chatRepository.markMessagesAsRead(chatId, userId);
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return await this.chatRepository.getUnreadMessageCount(userId);
  }

  async deleteChat(chatId: string): Promise<void> {
    if (!chatId) {
      throw new Error('Chat ID is required');
    }

    await this.chatRepository.deleteChat(chatId);
  }
  async deleteGroupChatByEventId(eventId: string): Promise<void> {
    if (!eventId) {
      throw new Error('Event ID is required');
    }

    const groupChat = await this.chatRepository.getGroupChatByEventId(eventId);
    if (!groupChat) {
      throw new Error('Group chat not found for this event');
    }

    await this.chatRepository.deleteGroupChatByEventId(eventId);
  }

  async getMessageById(messageId: string): Promise<IMessage | null> {
    if (!messageId) {
      throw new Error('Message ID is required');
    }

    return await this.chatRepository.getMessageById(messageId);
  }

  async updateMessage(messageId: string, content: string, userId: string): Promise<IMessage> {
    if (!messageId || !content || !userId) {
      throw new Error('Message ID, content, and User ID are required');
    }

    const existingMessage = await this.chatRepository.getMessageById(messageId);
    if (!existingMessage) {
      throw new Error('Message not found');
    }

    if (existingMessage.sender.toString() !== userId) {
      throw new Error('You can only edit your own messages');
    }

    const updatedMessage = await this.chatRepository.updateMessage(messageId, content.trim());
    if (!updatedMessage) {
      throw new Error('Failed to update message');
    }

    return updatedMessage;
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    if (!messageId || !userId) {
      throw new Error('Message ID and User ID are required');
    }

    const existingMessage = await this.chatRepository.getMessageById(messageId);
    if (!existingMessage) {
      throw new Error('Message not found');
    }

    if (existingMessage.sender.toString() !== userId) {
      throw new Error('You can only delete your own messages');
    }

    await this.chatRepository.deleteMessage(messageId);
  }

  async validateChatAccess(chatId: string, userId: string): Promise<boolean> {
    if (!chatId || !userId) {
      return false;
    }

    try {
      const chat = await this.chatRepository.getChatById(chatId);
      if (!chat || !chat.isActive) {
        return false;
      }

      const isParticipant = chat.participants.some((participant: { _id: { toString: () => any; }; toString: () => any; }) => {
        const participantId = participant._id ? participant._id.toString() : participant.toString();
        return participantId === userId;
      });

      console.log(`Access validation for chat ${chatId}, user ${userId}: ${isParticipant}`);
      return isParticipant;
      
    } catch (error) {
      console.error('Error validating chat access:', error);
      return false;
    }
  }
}