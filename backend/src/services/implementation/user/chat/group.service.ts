import { IMessageRepository } from "../../../../../src/repositories/interfaces/IMessage.repository";
import { IGroupChatRepository } from "../../../../../src/repositories/interfaces/IGroupChat.repository";
import { inject, injectable } from "tsyringe";
import { IGroupChatService } from "src/services/interfaces/user/chat/IGroupChatService";


@injectable()
export class GroupChatService implements IGroupChatService{
    constructor(
        @inject("GroupChatRepository") private groupChatRepository: IGroupChatRepository,
        @inject("MessageRepository") private messageRepository: IMessageRepository
    ) { }

    async createGroupChat(eventId: string, creatorId: string) {
        return this.groupChatRepository.createGroupChat(eventId, [creatorId]);
    }

    async addMemberToGroupChat(groupChatId: string, userId: string) {
        return this.groupChatRepository.addMemberToGroupChat(groupChatId, userId);
    }

    async getGroupChatByEventId(eventId: string) {
        return this.groupChatRepository.getGroupChatByEventId(eventId);
    }

    async getUserGroupChats(userId: string) {
        return this.groupChatRepository.getUserGroupChats(userId);
    }

    async sendGroupMessage(groupChatId: string, senderId: string, content: string) {
        return this.messageRepository.saveGroupMessage(groupChatId, senderId, content );
  }

    async getGroupChatMessages(groupChatId: string) {
        return this.messageRepository.getGroupChatMessages(groupChatId);
    }
}