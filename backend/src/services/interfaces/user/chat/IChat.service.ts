import { IChat, IMessage } from '../../../../models/ChatModel';

export interface IChatService {
  createPersonalChat(participantIds: string[]): Promise<IChat>;
  createEventChat(eventId: string, participantIds: string[]): Promise<IChat>;
  getChatById(chatId: string): Promise<IChat>;
  getUserChats(userId: string): Promise<IChat[]>;
  getChatMessages(chatId: string, limit?: number, skip?: number): Promise<IMessage[]>;
  addMessage(chatId: string, senderId: string, content: string): Promise<IMessage>;
  getChatBetweenUsers(userOneId: string, userTwoId: string): Promise<IChat | null>;
  getEventChat(eventId: string): Promise<IChat | null>;
  markMessagesAsRead(chatId: string, userId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;
  deleteChat(chatId: string): Promise<void>;
  joinEventChat(eventId: string, userId: string): Promise<IChat>;
  leaveEventChat(eventId: string, userId: string): Promise<void>;
  autoJoinUserToEventChat(eventId: string, userId: string): Promise<IChat>;
}