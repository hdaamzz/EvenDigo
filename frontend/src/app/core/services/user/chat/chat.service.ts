import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of, Subject } from 'rxjs';
import { map, catchError, tap, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { SocketService } from '../socket/socket.service';
import { User } from '../../../models/userModel';

export interface ChatUser {
  id: string;
  name: string;
  username?: string;
  lastMessage: string;
  lastMessageTime: Date;
  lastSeenTime?: Date;
  isOnline: boolean;
  unreadCount: number;
  profileImg?:string;
  chatId: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  createdAt?: Date;
  type: 'text' | 'image' | 'file';
  messageType?: 'text' | 'system' | 'image' | 'file';
}

export interface ApiChat {
  _id: string;
  participants: any[];
  lastMessage?: any;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  messageCount: number;
  lastMessageAt?: string;
}

export interface ApiMessage {
  _id: string;
  sender: any;
  content: string;
  timestamp: string;
  read: boolean;
  messageType: 'text' | 'system' | 'image' | 'file';
}

export interface SocketEventData {
  chatId: string;
  message: ChatMessage;
}

export interface UserStatusData {
  userId: string;
  status: string;
  lastSeen?: Date;
}

export interface MessagesReadData {
  chatId: string;
  userId: string;
  timestamp: Date;
}

export interface TypingData {
  userId: string;
  chatId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly apiUrl = `${environment.apiUrl}user/auth`;
  private currentUserId: string = "";
  private isInitialized = false;
  private destroy$ = new Subject<void>();
  private typingUsers = new Map<string, Set<string>>();
  private socketService?: SocketService;

  private chatUsersSubject = new BehaviorSubject<ChatUser[]>([]);
  public chatUsers$ = this.chatUsersSubject.asObservable();

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private isTypingSubject = new BehaviorSubject<boolean>(false);
  public isTyping$ = this.isTypingSubject.asObservable();

  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  private errorSubject = new BehaviorSubject<string>('');
  public error$ = this.errorSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.fetchCurrentUser();
  }

  async initialize(socketService: SocketService): Promise<void> {
    if (this.isInitialized && this.socketService === socketService) {
      return Promise.resolve();
    }

    try {
      if (this.isInitialized) {
        this.cleanup();
      }

      this.socketService = socketService;
      this.setupSocketListeners();
      this.isInitialized = true;

      await this.refreshPersonalChats();

    } catch (error) {
      this.handleError('Failed to initialize chat service', error);
      throw error;
    }
  }

  cleanup(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$ = new Subject<void>();
    this.isInitialized = false;
    this.typingUsers.clear();
  }

  private fetchCurrentUser(): void {
    this.authService.checkAuthStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.isAuthenticated && response.user?._id) {
            this.currentUserId = response.user._id;
          }
        },
        error: (error) => this.handleError('Failed to fetch current user', error)
      });
  }

  private setupSocketListeners(): void {
    if (!this.socketService) return;

    this.socketService.connectionStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(connected => {
        this.connectionStatusSubject.next(connected);
        if (connected) {
          this.clearError();
          this.refreshPersonalChats();
        }
      });

    this.socketService.listenSafe<SocketEventData>('newMessage')
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.handleNewMessage(data));

    this.socketService.listenSafe<UserStatusData>('userStatus')
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.handleUserStatusUpdate(data));

    this.socketService.listenSafe<TypingData>('userTyping')
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.handleUserTyping(data));

    this.socketService.listenSafe<TypingData>('userStoppedTyping')
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.handleUserStoppedTyping(data));

    this.socketService.listenSafe<MessagesReadData>('messagesRead')
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.handleMessagesRead(data));

    this.socketService.listenSafe<any>('error')
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.handleError('Socket error', error));
  }

  private handleNewMessage(data: SocketEventData): void {
    const { chatId, message } = data;

    const currentMessages = this.messagesSubject.getValue();
    const messageExists = currentMessages.some(msg => msg.id === message.id);

    if (!messageExists) {
      const updatedMessages = [...currentMessages, message].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      this.messagesSubject.next(updatedMessages);
    }

    this.refreshPersonalChats();

    if (message.senderId !== this.currentUserId) {
      this.calculateUnreadCount();
    }
  }

  private handleUserStatusUpdate(data: UserStatusData): void {
    const { userId, status, lastSeen } = data;
    const currentUsers = this.chatUsersSubject.getValue();

    const updatedUsers = currentUsers.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          isOnline: status === 'online',
          lastSeenTime: lastSeen
        };
      }
      return user;
    });

    this.chatUsersSubject.next(updatedUsers);
  }

  private handleUserTyping(data: TypingData): void {
    const { userId, chatId } = data;

    if (userId === this.currentUserId) return;

    if (!this.typingUsers.has(chatId)) {
      this.typingUsers.set(chatId, new Set());
    }

    this.typingUsers.get(chatId)!.add(userId);
    this.updateTypingStatus(chatId);
  }

  private handleUserStoppedTyping(data: TypingData): void {
    const { userId, chatId } = data;

    if (userId === this.currentUserId) return;

    const typingSet = this.typingUsers.get(chatId);
    if (typingSet) {
      typingSet.delete(userId);
      this.updateTypingStatus(chatId);
    }
  }

  private handleMessagesRead(data: MessagesReadData): void {
    const currentMessages = this.messagesSubject.getValue();
    const updatedMessages = currentMessages.map(msg => {
      if (msg.senderId === this.currentUserId) {
        return { ...msg, isRead: true };
      }
      return msg;
    });
    this.messagesSubject.next(updatedMessages);
  }

  private updateTypingStatus(chatId: string): void {
    const typingSet = this.typingUsers.get(chatId);
    const isTyping = typingSet ? typingSet.size > 0 : false;
    this.isTypingSubject.next(isTyping);
  }

  getPersonalChats(): Observable<ChatUser[]> {
    return this.http.get<any>(`${this.apiUrl}`).pipe(
      map(response => {
        const chats = response.data?.chats || response.data || [];
        const chatUsers = this.transformChatsToUsers(chats);
        this.chatUsersSubject.next(chatUsers);
        return chatUsers;
      }),
      catchError(error => {
        this.handleError('Failed to fetch personal chats', error);
        return of([]);
      })
    );
  }

  createOrGetPersonalChat(otherUserId: string): Observable<ApiChat> {
    return this.http.post<any>(`${this.apiUrl}/personal`, {
      otherUserId
    }).pipe(
      map(response => response.data),
      tap(() => this.refreshPersonalChats()),
      catchError(error => {
        this.handleError('Failed to create personal chat', error);
        throw error;
      })
    );
  }

  getChatBetweenUsers(otherUserId: string): Observable<ApiChat | null> {
    return this.http.get<any>(`${this.apiUrl}/personal/user/${otherUserId}`).pipe(
      map(response => response.data),
      catchError(error => {
        if (error.status === 404) {
          return of(null);
        }
        this.handleError('Failed to get chat between users', error);
        throw error;
      })
    );
  }

  getChatById(chatId: string): Observable<ApiChat> {
    return this.http.get<any>(`${this.apiUrl}/${chatId}`).pipe(
      map(response => response.data),
      catchError(error => {
        this.handleError('Failed to get chat by ID', error);
        throw error;
      })
    );
  }

  deleteChat(chatId: string): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/${chatId}`).pipe(
      map(() => void 0),
      tap(() => this.refreshPersonalChats()),
      catchError(error => {
        this.handleError('Failed to delete chat', error);
        throw error;
      })
    );
  }

  getChatMessages(chatId: string, limit: number = 50, skip: number = 0): Observable<ChatMessage[]> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('skip', skip.toString());

    return this.http.get<any>(`${this.apiUrl}/${chatId}/messages`, { params }).pipe(
      map(response => {
        const messages = this.transformApiMessages(response.data?.messages || response.data || []);
        this.messagesSubject.next(messages);
        return messages;
      }),
      catchError(error => {
        this.handleError('Failed to fetch chat messages', error);
        return of([]);
      })
    );
  }

  getChatMessagesWithPagination(chatId: string, page: number = 1, limit: number = 50): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/${chatId}/messages/paginated`, { params }).pipe(
      map(response => ({
        messages: this.transformApiMessages(response.data?.messages || []),
        pagination: response.data?.pagination
      })),
      catchError(error => {
        this.handleError('Failed to fetch paginated messages', error);
        return of({ messages: [], pagination: null });
      })
    );
  }


  sendMessage(chatId: string, content: string): Observable<ChatMessage> {
    return new Observable<ChatMessage>(subscriber => {
      if (!content.trim()) {
        subscriber.error(new Error('Message content cannot be empty'));
        return;
      }

      const tempMessage: ChatMessage = {
        id: 'temp-' + Date.now() + '-' + Math.random(),
        senderId: this.currentUserId,
        content: content.trim(),
        timestamp: new Date(),
        isRead: false,
        type: 'text',
        messageType: 'text'
      };

      // Add optimistic message
      const currentMessages = this.messagesSubject.getValue();
      this.messagesSubject.next([...currentMessages, tempMessage]);

      if (this.checkSocketConnection()) {
        // Send via socket
        this.socketService!.emit('sendMessage', {
          chatId,
          content: content.trim(),
          senderId: this.currentUserId,
          tempId: tempMessage.id
        });

        subscriber.next(tempMessage);
        subscriber.complete();
      } else {
        // Fallback to HTTP
        this.sendMessageHttp(chatId, content.trim(), tempMessage).subscribe(subscriber);
      }
    });
  }

  private sendMessageHttp(chatId: string, content: string, tempMessage?: ChatMessage): Observable<ChatMessage> {
    return this.http.post<any>(`${this.apiUrl}/${chatId}/messages`, {
      content,
      messageType: 'text'
    }).pipe(
      map(response => this.transformApiMessages([response.data])[0]),
      tap(message => {
        if (tempMessage) {
          const finalMessages = this.messagesSubject.getValue().map(msg =>
            msg.id === tempMessage.id ? message : msg
          );
          this.messagesSubject.next(finalMessages);
        }
      }),
      catchError(error => {
        if (tempMessage) {
          const finalMessages = this.messagesSubject.getValue().filter(msg =>
            msg.id !== tempMessage.id
          );
          this.messagesSubject.next(finalMessages);
        }
        this.handleError('Failed to send message', error);
        throw error;
      })
    );
  }


  markMessagesAsRead(chatId: string): Observable<void> {
    if (this.checkSocketConnection()) {
      this.socketService!.markAsRead(chatId);
    }


    return this.http.patch<any>(`${this.apiUrl}/${chatId}/read`, {}).pipe(
      map(() => void 0),
      tap(() => this.calculateUnreadCount()),
      catchError(error => {
        this.handleError('Failed to mark messages as read', error);
        return of(void 0);
      })
    );
  }


  getUnreadMessageCount(): Observable<number> {
    return this.chatUsers$.pipe(
      map(users => {
        const totalUnread = users.reduce((sum, user) => sum + user.unreadCount, 0);
        this.unreadCountSubject.next(totalUnread);
        return totalUnread;
      })
    );
  }


  getMessageById(messageId: string): Observable<ChatMessage> {
    return this.http.get<any>(`${this.apiUrl}/messages/${messageId}`).pipe(
      map(response => this.transformApiMessages([response.data])[0]),
      catchError(error => {
        this.handleError('Failed to get message by ID', error);
        throw error;
      })
    );
  }

  updateMessage(messageId: string, content: string): Observable<ChatMessage> {
    return this.http.put<any>(`${this.apiUrl}/messages/${messageId}`, {
      content
    }).pipe(
      map(response => this.transformApiMessages([response.data])[0]),
      catchError(error => {
        this.handleError('Failed to update message', error);
        throw error;
      })
    );
  }

  deleteMessage(messageId: string): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/messages/${messageId}`).pipe(
      map(() => void 0),
      catchError(error => {
        this.handleError('Failed to delete message', error);
        throw error;
      })
    );
  }




  joinChat(chatId: string): void {
    if (this.checkSocketConnection()) {
      this.socketService!.joinChat(chatId);
    }
  }

  startTyping(chatId: string): void {
    if (this.checkSocketConnection()) {
      this.socketService!.startTyping(chatId);
    }
  }
  stopTyping(chatId: string): void {
    if (this.checkSocketConnection()) {
      this.socketService!.stopTyping(chatId);
    }
  }

  getTypingStatus(chatId: string): boolean {
    const typingSet = this.typingUsers.get(chatId);
    return typingSet ? typingSet.size > 0 : false;
  }

  private transformChatsToUsers(chats: ApiChat[]): ChatUser[] {
    return chats.map(chat => {
      const otherParticipant = chat.participants.find(p => p._id !== this.currentUserId);

      const name = otherParticipant ?
        (otherParticipant.username || otherParticipant.email || 'Unknown User') :
        'Unknown User';

      const lastMessage = chat.lastMessage?.content || 'No messages yet';
      const lastMessageTime = chat.lastMessage?.timestamp ?
        new Date(chat.lastMessage.timestamp) :
        new Date(chat.updatedAt);

      const unreadCount = 0;

      return {
        id: otherParticipant?._id || 'unknown',
        name,
        lastMessage,
        lastMessageTime,
        isOnline: otherParticipant?.isOnline || false,
        unreadCount,
        chatId: chat._id,
        profileImg: otherParticipant?.profileImg
      };
    }).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
  }

  private transformApiMessages(apiMessages: ApiMessage[]): ChatMessage[] {
    return apiMessages
      .map(msg => ({
        id: msg._id,
        senderId: msg.sender?._id || '',
        content: msg.content || '',
        timestamp: new Date(msg.timestamp),
        isRead: msg.read || false,
        type: (msg.messageType as 'text' | 'image' | 'file') || 'text',
        messageType: msg.messageType || 'text'
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  private calculateUnreadCount(): void {
    const currentUsers = this.chatUsersSubject.getValue();
    const totalUnread = currentUsers.reduce((sum, user) => sum + user.unreadCount, 0);
    this.unreadCountSubject.next(totalUnread);
  }

  private refreshPersonalChats(): void {
    this.getPersonalChats().subscribe({
      error: (error) => this.handleError('Failed to refresh personal chats', error)
    });
  }

  private checkSocketConnection(): boolean {
    return this.socketService?.isConnected() || false;
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.errorSubject.next(message);
  }

  private clearError(): void {
    this.errorSubject.next('');
  }

  getCurrentUserId(): string {
    return this.currentUserId;
  }

  setCurrentUserId(userId: string): void {
    this.currentUserId = userId;
  }

  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  getAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}admin/users/all-users`).pipe(
      map(response => {
        console.log(response);

        if (!response) {
          throw new Error(response.message || 'Failed to fetch users');
        }
        return response.map((user: any) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          isOnline: true,
          profileImg: user.profileImg || null
        }));
      }),
      catchError(error => {
        this.handleError('Failed to fetch users', error);
        return of([]);
      })
    );
  }
}