import { IChat, IMessage } from "../../models/ChatModel";

export interface IChatRepository {
  createChat(
    participantIds: string[],
    chatType?: 'personal' | 'group',
    eventId?: string,
    name?: string
  ): Promise<IChat>;

  addParticipantToGroupChat(
    chatId: string,
    userId: string
  ): Promise<IChat>;

  getChatById(
    chatId: string
  ): Promise<IChat | null>;

  getUserChats(
    userId: string
  ): Promise<IChat[]>;

  getChatMessages(
    chatId: string,
    limit?: number,
    skip?: number
  ): Promise<IMessage[]>;

  addMessage(
    chatId: string,
    senderId: string,
    content: string,
    messageType?: 'text' | 'system' | 'image' | 'file'
  ): Promise<IMessage>;

  getChatBetweenUsers(
    userOneId: string,
    userTwoId: string
  ): Promise<IChat | null>;

  getGroupChatByEventId(
    eventId: string
  ): Promise<IChat | null>;

  markMessagesAsRead(
    chatId: string,
    userId: string
  ): Promise<void>;

  getUnreadMessageCount(
    userId: string
  ): Promise<number>;

  deleteChat(
    chatId: string
  ): Promise<void>;

  getChatMessagesWithPagination(
    chatId: string,
    page?: number,
    limit?: number
  ): Promise<{
    messages: IMessage[];
    totalMessages: number;
    totalPages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  }>;

  getMessageById(
    messageId: string
  ): Promise<IMessage | null>;

  updateMessage(
    messageId: string,
    content: string
  ): Promise<IMessage | null>;

  deleteMessage(
    messageId: string
  ): Promise<void>;

  deleteGroupChatByEventId(
    eventId: string
  ): Promise<void>;
  
}
