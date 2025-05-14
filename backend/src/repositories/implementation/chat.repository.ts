import { Chat } from '../../../src/models/chatSchema';
import { injectable } from 'tsyringe';
import { IChatRepository } from '../interfaces/IChat.repository';


@injectable()
export class ChatRepository implements IChatRepository{
  async createChat(participants: string[]) {
    return Chat.create({ participants });
  }

  async findChatByParticipants(participants: string[]) {
    return Chat.findOne({
      participants: { $all: participants, $size: participants.length },
    });
  }

  async getUserChats(userId: string) {
    return Chat.find({ participants: userId }).populate('participants');
  }

  
}