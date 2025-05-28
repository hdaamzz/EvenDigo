import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, switchMap } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export type ChatSection = 'personal' | 'events';

export interface ChatUser {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: Date;
  lastSeenTime?: Date;
  isOnline: boolean;
  unreadCount: number;
  section: ChatSection;
  avatar?: string;
  chatId?: string;
  eventId?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
  messageType?: 'text' | 'system' | 'image' | 'file';
}

export interface ApiChat {
  _id: string;
  participants: any[];
  messages: any[];
  chatType: 'personal' | 'event';
  eventId?: any;
  lastMessage?: any;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ApiMessage {
  _id: string;
  sender: any;
  content: string;
  timestamp: string;
  read: boolean;
  messageType: 'text' | 'system' | 'image' | 'file';
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private baseUrl = 'http://localhost:3000/api'; // Adjust to your API URL
  private currentUserId = 'current-user'; // You'll get this from your auth service

  private chatUsersSubject = new BehaviorSubject<ChatUser[]>([]);
  public chatUsers$ = this.chatUsersSubject.asObservable();

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.startPolling();
  }

  // Start polling for new messages every 5 seconds
  private startPolling() {
    interval(5000).pipe(
      switchMap(() => this.refreshUnreadCount())
    ).subscribe();
  }

  // Get all user chats
  getUserChats(): Observable<ChatUser[]> {
    return this.http.get<any>(`${this.baseUrl}/user/chats`).pipe(
      map(response => {
        const chatUsers = this.transformChatsToUsers(response.data);
        this.chatUsersSubject.next(chatUsers);
        return chatUsers;
      }),
      catchError(error => {
        console.error('Error fetching user chats:', error);
        return of([]);
      })
    );
  }

  // Get users by section (personal or events)
  getUsersBySection(section: ChatSection): Observable<ChatUser[]> {
    return this.getUserChats().pipe(
      map(users => users.filter(user => user.section === section))
    );
  }

  // Transform API chats to ChatUser format
  private transformChatsToUsers(chats: ApiChat[]): ChatUser[] {
    return chats.map(chat => {
      const isEventChat = chat.chatType === 'event';
      let name = '';
      let isOnline = false;

      if (isEventChat && chat.eventId) {
        name = chat.eventId.title || `Event Chat`;
        isOnline = true; // Event chats are always "online"
      } else {
        // For personal chats, find the other participant
        const otherParticipant = chat.participants.find(p => p._id !== this.currentUserId);
        name = otherParticipant ? (otherParticipant.username || otherParticipant.email) : 'Unknown User';
        isOnline = false; // You can implement online status later
      }

      const lastMessage = chat.lastMessage?.content || 'No messages yet';
      const lastMessageTime = chat.lastMessage?.timestamp ? new Date(chat.lastMessage.timestamp) : new Date(chat.updatedAt);
      
      // Calculate unread count (messages not sent by current user and not read)
      const unreadCount = chat.messages.filter(msg => 
        msg.sender._id !== this.currentUserId && !msg.read
      ).length;

      return {
        id: chat._id,
        name,
        lastMessage,
        lastMessageTime,
        isOnline,
        unreadCount,
        section: isEventChat ? 'events' : 'personal',
        chatId: chat._id,
        eventId: chat.eventId?._id
      };
    });
  }

  // Get messages for a specific chat
  getChatMessages(chatId: string, limit: number = 50, skip: number = 0): Observable<ChatMessage[]> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('skip', skip.toString());

    return this.http.get<any>(`${this.baseUrl}/user/chats/${chatId}/messages`, { params }).pipe(
      map(response => {
        const messages = this.transformApiMessages(response.data);
        this.messagesSubject.next(messages);
        return messages;
      }),
      catchError(error => {
        console.error('Error fetching chat messages:', error);
        return of([]);
      })
    );
  }

  // Transform API messages to ChatMessage format
  private transformApiMessages(apiMessages: ApiMessage[]): ChatMessage[] {
    return apiMessages.map(msg => ({
      id: msg._id,
      senderId: msg.sender._id,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      isRead: msg.read,
      type: msg.messageType as 'text' | 'image' | 'file',
      messageType: msg.messageType
    }));
  }

  // Get messages for user (wrapper for backward compatibility)
  getMessagesForUser(userId: string): Observable<ChatMessage[]> {
    return this.getChatMessages(userId);
  }

  // Send message (you'll need to implement this with Socket.IO or HTTP)
  sendMessage(chatId: string, content: string): Observable<ChatMessage> {
    // This will be implemented with Socket.IO for real-time messaging
    // For now, we'll use HTTP POST
    const messageData = {
      chatId,
      content,
      senderId: this.currentUserId
    };

    // You'll need to create an endpoint for sending messages
    return this.http.post<any>(`${this.baseUrl}/user/chats/${chatId}/messages`, messageData).pipe(
      map(response => ({
        id: response.data._id,
        senderId: this.currentUserId,
        content,
        timestamp: new Date(),
        isRead: false,
        type: 'text' as const
      })),
      catchError(error => {
        console.error('Error sending message:', error);
        throw error;
      })
    );
  }

  // Create personal chat
  createPersonalChat(otherUserId: string): Observable<ApiChat> {
    return this.http.post<any>(`${this.baseUrl}/user/chats/personal`, {
      participants: [this.currentUserId, otherUserId]
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error creating personal chat:', error);
        throw error;
      })
    );
  }

  // Get chat between users
  getChatBetweenUsers(otherUserId: string): Observable<ApiChat | null> {
    return this.http.get<any>(`${this.baseUrl}/user/chats/personal/user/${otherUserId}`).pipe(
      map(response => response.data),
      catchError(error => {
        if (error.status === 404) {
          return of(null);
        }
        console.error('Error getting chat between users:', error);
        throw error;
      })
    );
  }

  // Join event chat
  joinEventChat(eventId: string): Observable<ApiChat> {
    return this.http.post<any>(`${this.baseUrl}/user/chats/event/${eventId}/join`, {}).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error joining event chat:', error);
        throw error;
      })
    );
  }

  // Leave event chat
  leaveEventChat(eventId: string): Observable<void> {
    return this.http.post<any>(`${this.baseUrl}/user/chats/event/${eventId}/leave`, {}).pipe(
      map(() => void 0),
      catchError(error => {
        console.error('Error leaving event chat:', error);
        throw error;
      })
    );
  }

  // Mark messages as read
  markMessagesAsRead(chatId: string): Observable<void> {
    return this.http.patch<any>(`${this.baseUrl}/user/chats/${chatId}/read`, {}).pipe(
      map(() => void 0),
      catchError(error => {
        console.error('Error marking messages as read:', error);
        return of(void 0);
      })
    );
  }

  // Get unread message count
  getUnreadMessageCount(): Observable<number> {
    return this.http.get<any>(`${this.baseUrl}/user/chats/unread/count`).pipe(
      map(response => {
        const count = response.data.count;
        this.unreadCountSubject.next(count);
        return count;
      }),
      catchError(error => {
        console.error('Error getting unread count:', error);
        return of(0);
      })
    );
  }

  // Refresh unread count
  private refreshUnreadCount(): Observable<number> {
    return this.getUnreadMessageCount();
  }

  // Delete chat
  deleteChat(chatId: string): Observable<void> {
    return this.http.delete<any>(`${this.baseUrl}/user/chats/${chatId}`).pipe(
      map(() => void 0),
      catchError(error => {
        console.error('Error deleting chat:', error);
        throw error;
      })
    );
  }

  // Get current user ID (you'll integrate this with your auth service)
  getCurrentUserId(): string {
    return this.currentUserId;
  }

  // Set current user ID (call this from your auth service)
  setCurrentUserId(userId: string): void {
    this.currentUserId = userId;
  }
}