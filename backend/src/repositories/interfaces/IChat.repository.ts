export interface IChatRepository {
  createChat(participants: string[]): Promise<any>;
  findChatByParticipants(participants: string[]): Promise<any>;
  getUserChats(userId: string): Promise<any>;
}
