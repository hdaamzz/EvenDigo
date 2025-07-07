import { IChat, IMessage } from "../../../../models/interfaces/chat.interface";

export interface IChatService {
  createPersonalChat(participantIds: string[]): Promise<IChat>;
  createGroupChat(eventId: string, name: string, participantIds: string[]): Promise<IChat>;
  addParticipantToGroupChat(chatId: string, userId: string): Promise<IChat>;
  getChatById(chatId: string): Promise<IChat>;
  getUserChats(userId: string): Promise<IChat[]>;
  getChatMessages(chatId: string, limit?: number, skip?: number): Promise<IMessage[]>;
  getChatMessagesWithPagination(chatId: string, page?: number, limit?: number): Promise<{
    messages: IMessage[];
    totalMessages: number;
    totalPages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  }>;
  addMessage(chatId: string, senderId: string, content: string, messageType?: 'text' | 'system' | 'image' | 'file'): Promise<IMessage>;
  getChatBetweenUsers(userOneId: string, userTwoId: string): Promise<IChat | null>;
  getGroupChatByEventId(eventId: string): Promise<IChat | null>;
  markMessagesAsRead(chatId: string, userId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;
  deleteChat(chatId: string): Promise<void>;
  getMessageById(messageId: string): Promise<IMessage | null>;
  updateMessage(messageId: string, content: string, userId: string): Promise<IMessage>;
  deleteMessage(messageId: string, userId: string): Promise<void>;
  deleteGroupChatByEventId(eventId: string): Promise<void>
  validateChatAccess(chatId: string, userId: string): Promise<boolean>;
}