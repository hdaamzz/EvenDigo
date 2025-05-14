import { IMessageRepository } from '../../../../../src/repositories/interfaces/IMessage.repository';
import { IChatRepository } from '../../../../../src/repositories/interfaces/IChat.repository';
import { injectable, inject } from 'tsyringe';
import { IChatService } from '../../../../../src/services/interfaces/user/chat/IChatService';

@injectable()
export class ChatService implements IChatService{
  constructor(@inject("ChatRepository") private chatRepository: IChatRepository,
  @inject("MessageRepository") private messageRepository: IMessageRepository
) {}

  async createChat(participants: string[]) {
    let chat = await this.chatRepository.findChatByParticipants(participants);
    if (!chat) {
      chat = await this.chatRepository.createChat(participants);
    }
    return chat;
  }

  async getChat(chatId: string) {
    return this.chatRepository.findChatByParticipants([chatId]);
  }

  async getUserChats(userId: string) {
    return this.chatRepository.getUserChats(userId);
  }

  async sendMessage(chatId: string, senderId: string, content: string) {
    return this.messageRepository.saveMessage(chatId, senderId, content);
  }

  async getChatMessages(chatId: string) {
    return this.messageRepository.getChatMessages(chatId);
  }
}