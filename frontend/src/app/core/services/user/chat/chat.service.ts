import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of, Subject, combineLatest } from 'rxjs';
import { map, catchError, tap, takeUntil, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
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
  profileImg?: string;
  chatId: string;
}

export interface ChatMessage {
  id: string;
  chatId?: string;
  senderId: string | User;
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
  chatType?: 'personal' | 'group'; 
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
  chatType?: 'personal' | 'group';
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
  chatType?: 'personal' | 'group';
}

export interface TypingData {
  userId: string;
  chatId: string;
  chatType?: 'personal' | 'group';
}

export interface GroupChat {
  id: string;
  name: string;
  eventId: string;
  participants: ChatUser[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isActive: boolean;
  chatType: 'group';
}

export interface ApiGroupChat extends ApiChat {
  name: string;
  eventId: string;
  chatType: 'group';
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly apiUrl = `${environment.apiUrl}user/chats`;
  private currentUserId: string = "";
  private isInitialized = false;
  private destroy$ = new Subject<void>();
  private typingUsers = new Map<string, Set<string>>();
  private socketService?: SocketService;

  // Separate subjects for personal and group chats
  private chatUsersSubject = new BehaviorSubject<ChatUser[]>([]);
  public chatUsers$ = this.chatUsersSubject.asObservable();

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private groupChatsSubject = new BehaviorSubject<GroupChat[]>([]);
  public groupChats$ = this.groupChatsSubject.asObservable();

  // Combined unread count from both personal and group chats
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private isTypingSubject = new BehaviorSubject<{[chatId: string]: boolean}>({});
  public isTyping$ = this.isTypingSubject.asObservable();

  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  private currentChatTypeSubject = new BehaviorSubject<'personal' | 'group'>('personal');
  public currentChatType$ = this.currentChatTypeSubject.asObservable();

  private errorSubject = new BehaviorSubject<string>('');
  public error$ = this.errorSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.fetchCurrentUser();
    this.setupUnreadCountCalculation();
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

      // Load both personal and group chats
      await Promise.all([
        this.refreshPersonalChats(),
        this.refreshGroupChats()
      ]);

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

  private setupUnreadCountCalculation(): void {
    // Combine personal and group chat unread counts
    combineLatest([this.chatUsers$, this.groupChats$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([personalChats, groupChats]) => {
        const personalUnread = personalChats.reduce((sum, chat) => sum + chat.unreadCount, 0);
        const groupUnread = groupChats.reduce((sum, chat) => sum + chat.unreadCount, 0);
        const totalUnread = personalUnread + groupUnread;
        this.unreadCountSubject.next(totalUnread);
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
          this.refreshAllChats();
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

    // Group chat specific listeners
    this.setupGroupChatListeners();
  }

  private setupGroupChatListeners(): void {
    if (!this.socketService) return;

    this.socketService.listenSafe<any>('groupChatInfo')
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        console.log('Group chat info received:', data);
        this.refreshGroupChats();
      });

    this.socketService.listenSafe<any>('userJoinedChat')
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        console.log('User joined chat:', data);
        if (data.chatType === 'group') {
          this.refreshGroupChats();
        }
      });

    this.socketService.listenSafe<any>('userLeftChat')
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        console.log('User left chat:', data);
        if (data.chatType === 'group') {
          this.refreshGroupChats();
        }
      });
  }

  private handleNewMessage(data: SocketEventData): void {
    const { chatId, message, chatType } = data;

    const currentMessages = this.messagesSubject.getValue();
    const messageExists = currentMessages.some(msg => msg.id === message.id);

    if (!messageExists) {
      const updatedMessages = [...currentMessages, message].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      this.messagesSubject.next(updatedMessages);
    }

    // Refresh appropriate chat type
    if (chatType === 'group') {
      this.refreshGroupChats();
    } else {
      this.refreshPersonalChats();
    }

    // Auto-calculate unread count will be handled by the combined observable
  }

  private handleUserStatusUpdate(data: UserStatusData): void {
    const { userId, status, lastSeen } = data;
    
    // Update personal chats
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

    // Update group chats
    const currentGroupChats = this.groupChatsSubject.getValue();
    const updatedGroupChats = currentGroupChats.map(groupChat => ({
      ...groupChat,
      participants: groupChat.participants.map(participant => {
        if (participant.id === userId) {
          return {
            ...participant,
            isOnline: status === 'online',
            lastSeenTime: lastSeen
          };
        }
        return participant;
      })
    }));
    this.groupChatsSubject.next(updatedGroupChats);
  }

  private handleUserTyping(data: TypingData): void {
    const { userId, chatId, chatType } = data;

    if (userId === this.currentUserId) return;

    if (!this.typingUsers.has(chatId)) {
      this.typingUsers.set(chatId, new Set());
    }

    this.typingUsers.get(chatId)!.add(userId);
    this.updateTypingStatus(chatId);
  }

  private handleUserStoppedTyping(data: TypingData): void {
    const { userId, chatId, chatType } = data;

    if (userId === this.currentUserId) return;

    const typingSet = this.typingUsers.get(chatId);
    if (typingSet) {
      typingSet.delete(userId);
      this.updateTypingStatus(chatId);
    }
  }

  private handleMessagesRead(data: MessagesReadData): void {
    const { chatId, userId, timestamp, chatType } = data;
    
    const currentMessages = this.messagesSubject.getValue();
    const updatedMessages = currentMessages.map(msg => {
      if (msg.chatId === chatId && msg.senderId === this.currentUserId) {
        return { ...msg, isRead: true };
      }
      return msg;
    });
    this.messagesSubject.next(updatedMessages);

    // Refresh appropriate chat type to update unread counts
    if (chatType === 'group') {
      this.refreshGroupChats();
    } else {
      this.refreshPersonalChats();
    }
  }

  private updateTypingStatus(chatId: string): void {
    const typingSet = this.typingUsers.get(chatId);
    const isTyping = typingSet ? typingSet.size > 0 : false;
    
    const currentTypingStatus = this.isTypingSubject.getValue();
    this.isTypingSubject.next({
      ...currentTypingStatus,
      [chatId]: isTyping
    });
  }

  // Unified method to get all chats
  getUserChats(): Observable<{ personalChats: ChatUser[], groupChats: GroupChat[] }> {
    return this.http.get<any>(`${this.apiUrl}`).pipe(
      map(response => {
        const chats = response.data?.chats || response.data || [];
        
        const personalChats = chats
          .filter((chat: any) => !chat.chatType || chat.chatType === 'personal')
          .map((chat: any) => this.transformChatToUser(chat));
        
        const groupChats = chats
          .filter((chat: any) => chat.chatType === 'group')
          .map((chat: any) => this.transformGroupChat(chat));
        
        this.chatUsersSubject.next(personalChats);
        this.groupChatsSubject.next(groupChats);
        
        return { personalChats, groupChats };
      }),
      catchError(error => {
        this.handleError('Failed to fetch user chats', error);
        return of({ personalChats: [], groupChats: [] });
      })
    );
  }

  // Personal chat methods
  getPersonalChats(): Observable<ChatUser[]> {
    return this.http.get<any>(`${this.apiUrl}`).pipe(
      map(response => {
        const chats = response.data?.chats || response.data || [];
        const personalChats = chats
          .filter((chat: any) => !chat.chatType || chat.chatType === 'personal')
          .map((chat: any) => this.transformChatToUser(chat));
        this.chatUsersSubject.next(personalChats);
        return personalChats;
      }),
      catchError(error => {
        this.handleError('Failed to fetch personal chats', error);
        return of([]);
      })
    );
  }

  private transformChatToUser(chat: ApiChat): ChatUser {
    const otherParticipant = chat.participants.find(p => p._id !== this.currentUserId);

    const name = otherParticipant ?
      (otherParticipant.username || otherParticipant.email || 'Unknown User') :
      'Unknown User';

    const lastMessage = chat.lastMessage?.content || 'No messages yet';
    const lastMessageTime = chat.lastMessage?.timestamp ?
      new Date(chat.lastMessage.timestamp) :
      new Date(chat.updatedAt);

    // Calculate unread count properly based on your backend implementation
    const unreadCount = this.calculateUnreadCountForChat(chat);

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
  }

  private calculateUnreadCountForChat(chat: ApiChat): number {
    // This should be implemented based on your backend's unread count logic
    // For now, returning 0 - you should implement this based on your backend response
    return chat.messageCount || 0; // Adjust this based on your actual backend response
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

  // Group chat methods
  getGroupChats(): Observable<GroupChat[]> {
    return this.http.get<any>(`${this.apiUrl}`).pipe(
      map(response => {
        const chats = response.data?.chats || response.data || [];
        const groupChats = chats.filter((chat: any) => chat.chatType === 'group');
        const transformedGroupChats = this.transformGroupChats(groupChats);
        this.groupChatsSubject.next(transformedGroupChats);
        return transformedGroupChats;
      }),
      catchError(error => {
        this.handleError('Failed to fetch group chats', error);
        return of([]);
      })
    );
  }

  createGroupChat(eventId: string, name: string, participantIds?: string[]): Observable<ApiGroupChat> {
    return this.http.post<any>(`${this.apiUrl}/group`, {
      eventId,
      name,
      participantIds: participantIds || []
    }).pipe(
      map(response => response.data),
      tap(() => this.refreshGroupChats()),
      catchError(error => {
        this.handleError('Failed to create group chat', error);
        throw error;
      })
    );
  }

  getGroupChatByEventId(eventId: string): Observable<ApiGroupChat | null> {
    return this.http.get<any>(`${this.apiUrl}/group/event/${eventId}`).pipe(
      map(response => response.data),
      catchError(error => {
        if (error.status === 404) {
          return of(null);
        }
        this.handleError('Failed to get group chat by event ID', error);
        throw error;
      })
    );
  }

  createOrGetGroupChat(eventId: string, name: string, participantIds?: string[]): Observable<ApiGroupChat> {
    return this.getGroupChatByEventId(eventId).pipe(
      switchMap(existingChat => {
        if (existingChat) {
          return of(existingChat);
        }
        return this.createGroupChat(eventId, name, participantIds);
      })
    );
  }

  addParticipantToGroupChat(chatId: string, userId: string): Observable<ApiGroupChat> {
    return this.http.post<any>(`${this.apiUrl}/group/${chatId}/participants`, {
      userId
    }).pipe(
      map(response => response.data),
      tap(() => this.refreshGroupChats()),
      catchError(error => {
        this.handleError('Failed to add participant to group chat', error);
        throw error;
      })
    );
  }

  private transformGroupChat(apiChat: ApiGroupChat): GroupChat {
    const lastMessage = apiChat.lastMessage?.content || 'No messages yet';
    const lastMessageTime = apiChat.lastMessage?.timestamp 
      ? new Date(apiChat.lastMessage.timestamp)
      : new Date(apiChat.updatedAt);

    return {
      id: apiChat._id,
      name: apiChat.name,
      eventId: apiChat.eventId,
      participants: apiChat.participants.map(p => ({
        id: p._id,
        name: p.username || p.email,
        username: p.username,
        lastMessage: '',
        lastMessageTime: new Date(),
        isOnline: p.isOnline || false,
        unreadCount: 0,
        profileImg: p.profileImg,
        chatId: apiChat._id
      })),
      lastMessage,
      lastMessageTime,
      unreadCount: this.calculateUnreadCountForChat(apiChat),
      isActive: apiChat.isActive,
      chatType: 'group'
    };
  }

  private transformGroupChats(apiChats: ApiGroupChat[]): GroupChat[] {
    return apiChats
      .map(chat => this.transformGroupChat(chat))
      .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
  }

  // Message methods
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

  sendMessage(chatId: string, content: string, chatType: 'personal' | 'group' = 'personal'): Observable<ChatMessage> {
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
        messageType: 'text',
        chatId
      };

      const currentMessages = this.messagesSubject.getValue();
      this.messagesSubject.next([...currentMessages, tempMessage]);

      if (this.checkSocketConnection()) {
        this.socketService!.emit('sendMessage', {
          chatId,
          content: content.trim(),
          senderId: this.currentUserId,
          tempId: tempMessage.id,
          chatType
        });

        subscriber.next(tempMessage);
        subscriber.complete();
      } else {
        this.sendMessageHttp(chatId, content.trim(), chatType, tempMessage).subscribe(subscriber);
      }
    });
  }

  private sendMessageHttp(chatId: string, content: string, chatType: 'personal' | 'group', tempMessage?: ChatMessage): Observable<ChatMessage> {
    const endpoint = chatType === 'group' 
      ? `${this.apiUrl}/group/${chatId}/messages`
      : `${this.apiUrl}/${chatId}/messages`;

    return this.http.post<any>(endpoint, {
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

  markMessagesAsRead(chatId: string, chatType: 'personal' | 'group' = 'personal'): Observable<void> {
    if (this.checkSocketConnection()) {
      this.socketService!.markAsRead(chatId, chatType);
    }

    const endpoint = chatType === 'group' 
      ? `${this.apiUrl}/group/${chatId}/read`
      : `${this.apiUrl}/${chatId}/read`;

    return this.http.patch<any>(endpoint, {}).pipe(
      map(() => void 0),
      tap(() => {
        if (chatType === 'group') {
          this.refreshGroupChats();
        } else {
          this.refreshPersonalChats();
        }
      }),
      catchError(error => {
        this.handleError('Failed to mark messages as read', error);
        return of(void 0);
      })
    );
  }

  // Chat interaction methods
  joinChat(chatId: string, chatType: 'personal' | 'group' = 'personal'): void {
    if (this.checkSocketConnection()) {
      this.socketService!.joinChat(chatId, chatType);
    }
  }

  startTyping(chatId: string, chatType: 'personal' | 'group' = 'personal'): void {
    if (this.checkSocketConnection()) {
      this.socketService!.startTyping(chatId, chatType);
    }
  }

  stopTyping(chatId: string, chatType: 'personal' | 'group' = 'personal'): void {
    if (this.checkSocketConnection()) {
      this.socketService!.stopTyping(chatId, chatType);
    }
  }

  getTypingStatus(chatId: string): boolean {
    const currentTypingStatus = this.isTypingSubject.getValue();
    return currentTypingStatus[chatId] || false;
  }

  // Utility methods
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

  setChatType(chatType: 'personal' | 'group'): void {
    this.currentChatTypeSubject.next(chatType);
  }

  getCurrentChatType(): 'personal' | 'group' {
    return this.currentChatTypeSubject.getValue();
  }

  private refreshAllChats(): void {
    this.getUserChats().subscribe({
      error: (error) => this.handleError('Failed to refresh all chats', error)
    });
  }

  private refreshPersonalChats(): void {
    this.getPersonalChats().subscribe({
      error: (error) => this.handleError('Failed to refresh personal chats', error)
    });
  }

  private refreshGroupChats(): void {
    this.getGroupChats().subscribe({
      error: (error) => this.handleError('Failed to refresh group chats', error)
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

  // Getters and setters
  getCurrentUserId(): string {
    return this.currentUserId;
  }

  setCurrentUserId(userId: string): void {
    this.currentUserId = userId;
  }

  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  // Additional utility methods
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

  getAllUsers(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}admin/users/all-users`).pipe(
      map(response => {
        if (!response) {
          throw new Error(response?.message || 'Failed to fetch users');
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