import { IMessage } from "../../../../../src/models/ChatModel";


export interface IChatService {
  createChat(participantIds: string[]): Promise<any>;
  getChatById(chatId: string): Promise<any>;
  getUserChats(userId: string): Promise<any[]>;
  getChatMessages(chatId: string, limit?: number, skip?: number): Promise<IMessage[]>;
  addMessage(chatId: string, senderId: string, content: string): Promise<IMessage>;
  getChatBetweenUsers(userOneId: string, userTwoId: string): Promise<any>;
  markMessagesAsRead(chatId: string, userId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;
  deleteChat(chatId: string): Promise<void>;
}