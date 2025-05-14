export interface IGroupChatService {
  createGroupChat(eventId: string, creatorId: string): Promise<any>;
  addMemberToGroupChat(groupChatId: string, userId: string): Promise<any>;
  getGroupChatByEventId(eventId: string): Promise<any>;
  getUserGroupChats(userId: string): Promise<any>;
  sendGroupMessage(groupChatId: string, senderId: string, content: string): Promise<any>;
  getGroupChatMessages(groupChatId: string): Promise<any>;
}
