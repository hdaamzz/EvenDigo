export interface IChatService {
  createChat(participants: string[]): Promise<any>;
  getChat(chatId: string): Promise<any>;
  getUserChats(userId: string): Promise<any>;
  sendMessage(chatId: string, senderId: string, content: string): Promise<any>;
  getChatMessages(chatId: string): Promise<any>;
}
