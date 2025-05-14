import { Message } from '../../../src/models/chatSchema';
import { injectable } from 'tsyringe';
import { IMessageRepository } from '../interfaces/IMessage.repository';

@injectable()
export class MessageRepository implements IMessageRepository{

  async saveMessage(chatId: string, senderId: string, content: string) {
    return Message.create({ chatId, senderId, content });
  }

  async getChatMessages(chatId: string) {
    return Message.find({ chatId }).populate('senderId');
  }

  async saveGroupMessage(groupChatId: string, senderId: string, content: string) {
    return Message.create({ groupChatId, senderId, content });
  }

  async getGroupChatMessages(groupChatId: string) {
    return Message.find({ groupChatId }).populate('senderId');
  }
}