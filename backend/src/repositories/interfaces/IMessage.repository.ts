

export interface IMessageRepository {
  saveMessage(chatId: string, senderId: string, content: string): Promise<any>;
  getChatMessages(chatId: string): Promise<any>;
  saveGroupMessage(groupChatId: string, senderId: string, content: string): Promise<any>;
  getGroupChatMessages(groupChatId: string): Promise<any>;
}
