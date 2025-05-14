export interface IGroupChatRepository {
  createGroupChat(eventId: string, members: string[]): Promise<any>;
  addMemberToGroupChat(groupChatId: string, userId: string): Promise<any>;
  getGroupChatByEventId(eventId: string): Promise<any>;
  getUserGroupChats(userId: string): Promise<any>;
}
