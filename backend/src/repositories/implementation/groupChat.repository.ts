import { GroupChat } from '../../../src/models/chatSchema';
import { injectable } from 'tsyringe';
import { IGroupChatRepository } from '../interfaces/IGroupChat.repository';

@injectable()
export class GroupChatRepository implements IGroupChatRepository{
  async createGroupChat(eventId: string, members: string[]) {
    return GroupChat.create({ eventId, members });
  }

  async addMemberToGroupChat(groupChatId: string, userId: string) {
    return GroupChat.findByIdAndUpdate(
      groupChatId,
      { $addToSet: { members: userId } },
      { new: true },
    );
  }

  async getGroupChatByEventId(eventId: string) {
    return GroupChat.findOne({ eventId });
  }

  async getUserGroupChats(userId: string) {
    return GroupChat.find({ members: userId }).populate('eventId');
  }
}