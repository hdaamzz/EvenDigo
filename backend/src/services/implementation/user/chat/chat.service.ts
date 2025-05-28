// src/services/implementation/user/chat/chat.service.ts
import { IChatRepository } from "src/repositories/interfaces/IChat.repository";
import { IChat, IMessage } from "../../../../models/ChatModel";
import { IChatService } from "../../../interfaces/user/chat/IChat.service";
import { inject, injectable } from "tsyringe";

@injectable()
export class ChatService implements IChatService {
  constructor(
    @inject('ChatRepository') private chatRepository: IChatRepository
  ) {}

  async createPersonalChat(participantIds: string[]): Promise<IChat> {
    if (participantIds.length !== 2) {
      throw new Error('Personal chat requires exactly 2 participants');
    }
    
    return await this.chatRepository.createChat(participantIds, 'personal');
  }

  async createEventChat(eventId: string, participantIds: string[] = []): Promise<IChat> {
    if (!eventId) {
      throw new Error('Event ID is required for event chat');
    }
    
    return await this.chatRepository.createChat(participantIds, 'event', eventId);
  }

  async getChatById(chatId: string): Promise<IChat> {
    const chat = await this.chatRepository.getChatById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }
    return chat;
  }

  async getUserChats(userId: string): Promise<IChat[]> {
    return await this.chatRepository.getUserChats(userId);
  }

  async getChatMessages(chatId: string, limit: number = 50, skip: number = 0): Promise<IMessage[]> {
    return await this.chatRepository.getChatMessages(chatId, limit, skip);
  }

  async addMessage(chatId: string, senderId: string, content: string): Promise<IMessage> {
    if (!content.trim()) {
      throw new Error('Message content cannot be empty');
    }
    
    return await this.chatRepository.addMessage(chatId, senderId, content);
  }

  async getChatBetweenUsers(userOneId: string, userTwoId: string): Promise<IChat | null> {
    return await this.chatRepository.getChatBetweenUsers(userOneId, userTwoId);
  }

  async getEventChat(eventId: string): Promise<IChat | null> {
    return await this.chatRepository.getEventChat(eventId);
  }

  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    await this.chatRepository.markMessagesAsRead(chatId, userId);
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    return await this.chatRepository.getUnreadMessageCount(userId);
  }

  async deleteChat(chatId: string): Promise<void> {
    await this.chatRepository.deleteChat(chatId);
  }

  async joinEventChat(eventId: string, userId: string): Promise<IChat> {
    // Check if event chat exists, if not create it
    let eventChat = await this.chatRepository.getEventChat(eventId);
    
    if (!eventChat) {
      // Create event chat with the user as first participant
      eventChat = await this.chatRepository.createChat([userId], 'event', eventId);
    } else {
      // Add user to existing event chat
      const updatedChat = await this.chatRepository.addParticipantToEventChat(eventId, userId);
      if (updatedChat) {
        eventChat = updatedChat;
      }
    }
    
    return eventChat;
  }

  async leaveEventChat(eventId: string, userId: string): Promise<void> {
    await this.chatRepository.removeParticipantFromEventChat(eventId, userId);
  }

  async autoJoinUserToEventChat(eventId: string, userId: string): Promise<IChat> {
    let eventChat = await this.chatRepository.getEventChat(eventId);
    
    if (!eventChat) {
      eventChat = await this.chatRepository.createChat([userId], 'event', eventId);
      
      await this.chatRepository.addMessage(
        eventChat._id.toString(), 
        userId, 
        `Welcome to the event chat! This chat was created for event participants.`
      );
    } else {
      const updatedChat = await this.chatRepository.addParticipantToEventChat(eventId, userId);
      if (updatedChat) {
        eventChat = updatedChat;
        
        await this.chatRepository.addMessage(
          eventChat._id.toString(), 
          userId, 
          `A new participant has joined the event chat!`
        );
      }
    }
    
    return eventChat;
  }
}