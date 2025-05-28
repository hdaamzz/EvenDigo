import { IChat, IMessage } from "../../../src/models/ChatModel";

export interface IChatRepository {
  createChat(participantIds: string[], chatType: 'personal' | 'event', eventId?: string): Promise<IChat>;
  getChatById(chatId: string): Promise<IChat | null>;
  getUserChats(userId: string): Promise<IChat[]>;
  getChatMessages(chatId: string, limit: number, skip: number): Promise<IMessage[]>;
  addMessage(chatId: string, senderId: string, content: string): Promise<IMessage>;
  getChatBetweenUsers(userOneId: string, userTwoId: string): Promise<IChat | null>;
  getEventChat(eventId: string): Promise<IChat | null>;
  markMessagesAsRead(chatId: string, userId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;
  deleteChat(chatId: string): Promise<void>;
  addParticipantToEventChat(eventId: string, userId: string): Promise<IChat | null>;
  removeParticipantFromEventChat(eventId: string, userId: string): Promise<void>;
}