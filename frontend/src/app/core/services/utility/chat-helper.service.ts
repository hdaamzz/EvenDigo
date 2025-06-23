import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../../models/userModel';
import { ChatItem, ChatMessage, ChatUser, GroupChat } from '../../interfaces/user/chat';


@Injectable({
  providedIn: 'root'
})
export class ChatHelperService {

  private subscriptions: Subscription[] = [];
  private typingTimeout: any;

  formatTime(date: Date): string {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  }

  formatLastMessageTime(date: Date): string {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return this.formatTime(date);
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  getUserInitials(name: string): string {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  }

  getUnreadCountText(count: number): string {
    return count > 99 ? '99+' : count.toString();
  }

  checkIsMobile(): boolean {
    return window.innerWidth < 1024;
  }

  adjustTextareaHeight(event: any): void {
    const textarea = event.target;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
    }
  }

  scrollToBottom(element: any): void {
    try {
      if (element?.nativeElement) {
        const el = element.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  filterUsers(users: User[], searchTerm: string): User[] {
    if (!searchTerm) return users;
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  filterChatUsers(users: ChatUser[], searchTerm: string): ChatUser[] {
    if (!searchTerm) return users;
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  filterChatItems(chats: ChatItem[], searchTerm: string): ChatItem[] {
    if (!searchTerm.trim()) return chats;
    const term = searchTerm.toLowerCase();
    return chats.filter(chat =>
      chat.name.toLowerCase().includes(term) ||
      (chat.username && chat.username.toLowerCase().includes(term)) ||
      chat.lastMessage.toLowerCase().includes(term)
    );
  }

  createOptimisticMessage(content: string, currentUserId: string): ChatMessage {
    const tempId = 'temp-' + Date.now() + '-' + Math.random();
    return {
      id: tempId,
      content: content,
      senderId: currentUserId,
      timestamp: new Date(),
      createdAt: new Date(),
      isRead: false,
      type: 'text'
    };
  }

  createChatMessage(data: any): ChatMessage {
    return {
      id: data.message.id || data.message._id,
      chatId: data.message.chatId,
      senderId: data.message.senderId || data.message.sender?._id,
      content: data.message.content,
      timestamp: new Date(data.message.timestamp),
      createdAt: new Date(data.message.createdAt || data.message.timestamp),
      isRead: data.message.isRead || false,
      type: data.message.type || 'text',
      messageType: data.message.messageType || 'text'
    };
  }

  createChatUser(user: User, chat?: any): ChatUser {
    return {
      id: user.id ?? '',
      name: user.name,
      lastMessage: chat?.lastMessage?.content || 'No messages yet',
      lastMessageTime: chat?.lastMessageAt ? new Date(chat.lastMessageAt) : new Date(),
      isOnline: true,
      unreadCount: 0,
      chatId: chat?._id,
      profileImg: user.profileImg
    };
  }

  updateMessageInList(messages: ChatMessage[], newMessage: ChatMessage, selectedChatId?: string): ChatMessage[] {
    if (selectedChatId && newMessage.chatId && newMessage.chatId !== selectedChatId) {
      return messages;
    }

    const existingIndex = messages.findIndex(msg =>
      msg.id === newMessage.id ||
      (msg.id.toString().startsWith('temp-') &&
        msg.content === newMessage.content &&
        Math.abs(new Date(msg.timestamp).getTime() - new Date(newMessage.timestamp).getTime()) < 5000)
    );

    if (existingIndex !== -1) {
      const updatedMessages = [...messages];
      updatedMessages[existingIndex] = newMessage;
      return updatedMessages;
    } else {
      return [...messages, newMessage];
    }
  }

  updateUserInList(users: ChatUser[], updatedUser: ChatUser): ChatUser[] {
    const userIndex = users.findIndex(user => user.id === updatedUser.id);
    if (userIndex !== -1) {
      const updatedUsers = [...users];
      updatedUsers[userIndex] = updatedUser;
      return this.sortUsersByLastMessage(updatedUsers);
    }
    return [updatedUser, ...users.filter(u => u.id !== updatedUser.id)];
  }

  updateUserLastMessage(
    users: ChatUser[],
    chatId: string,
    message: ChatMessage,
    currentUserId: string,
    selectedChatId?: string
  ): ChatUser[] {
    const userIndex = users.findIndex(user => user.chatId === chatId);
    if (userIndex !== -1) {
      const updatedUsers = [...users];
      const isCurrentUserMessage = message.senderId === currentUserId;
      const isChatSelected = selectedChatId === chatId;

      const shouldIncrementUnread = !isCurrentUserMessage && !isChatSelected;

      updatedUsers[userIndex] = {
        ...updatedUsers[userIndex],
        lastMessage: message.content,
        lastMessageTime: message.createdAt ?? new Date(),
        unreadCount: shouldIncrementUnread ?
          updatedUsers[userIndex].unreadCount + 1 :
          updatedUsers[userIndex].unreadCount
      };
      return this.sortUsersByLastMessage(updatedUsers);
    }
    return users;
  }

  updateGroupChatLastMessage(
    groupChats: GroupChat[],
    chatId: string,
    message: ChatMessage,
    currentUserId: string,
    selectedChatId?: string
  ): GroupChat[] {
    const chatIndex = groupChats.findIndex(chat => chat.id === chatId);
    if (chatIndex !== -1) {
      const updatedChats = [...groupChats];
      const isCurrentUserMessage = message.senderId === currentUserId;
      const isChatSelected = selectedChatId === chatId;

      const shouldIncrementUnread = !isCurrentUserMessage && !isChatSelected;

      updatedChats[chatIndex] = {
        ...updatedChats[chatIndex],
        lastMessage: message.content,
        lastMessageTime: message.createdAt ?? new Date(),
        unreadCount: shouldIncrementUnread ?
          updatedChats[chatIndex].unreadCount + 1 :
          updatedChats[chatIndex].unreadCount
      };
      return this.sortGroupChatsByLastMessage(updatedChats);
    }
    return groupChats;
  }

  clearUnreadCount(users: ChatUser[], chatId: string): ChatUser[] {
    const userIndex = users.findIndex(user => user.chatId === chatId);
    if (userIndex !== -1) {
      const updatedUsers = [...users];
      updatedUsers[userIndex] = {
        ...updatedUsers[userIndex],
        unreadCount: 0
      };
      return updatedUsers;
    }
    return users;
  }

  clearGroupChatUnreadCount(groupChats: GroupChat[], chatId: string): GroupChat[] {
    const chatIndex = groupChats.findIndex(chat => chat.id === chatId);
    if (chatIndex !== -1) {
      const updatedChats = [...groupChats];
      updatedChats[chatIndex] = {
        ...updatedChats[chatIndex],
        unreadCount: 0
      };
      return updatedChats;
    }
    return groupChats;
  }

  updateUserStatus(users: ChatUser[], userId: string, isOnline: boolean): ChatUser[] {
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      const updatedUsers = [...users];
      updatedUsers[userIndex] = {
        ...updatedUsers[userIndex],
        isOnline
      };
      return updatedUsers;
    }
    return users;
  }

  sortUsersByLastMessage(users: ChatUser[]): ChatUser[] {
    return users.sort((a, b) =>
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
  }

  sortGroupChatsByLastMessage(groupChats: GroupChat[]): GroupChat[] {
    return groupChats.sort((a, b) =>
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
  }

  getErrorMessage(error: any): string {
    if (error?.message) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unexpected error occurred';
  }

  startTypingIndicator(callback: () => void): void {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    this.typingTimeout = setTimeout(callback, 2000);
  }

  clearTypingTimeout(): void {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  addSubscription(subscription: Subscription): void {
    this.subscriptions.push(subscription);
  }

  unsubscribeAll(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    this.clearTypingTimeout();
  }

  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw new Error(`Operation failed after ${maxRetries} attempts: ${this.getErrorMessage(error)}`);
        }
        await new Promise(resolve => setTimeout(resolve, baseDelay * attempt));
      }
    }
    throw new Error('Retry operation failed');
  }

  isValidMessage(content: string): boolean {
    return content.trim().length > 0;
  }

  isValidUser(user: any): boolean {
    return user && user.id && user.name;
  }

  isValidChatUser(user: any): boolean {
    return user && user.id && user.chatId;
  }

  trackByUserId(index: number, user: User | ChatUser): string {
    return user.id || '';
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }

  trackByChatId(index: number, chat: ChatItem): string {
    return chat.chatId || chat.id;
  }
}