import { AfterViewChecked, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage, ChatService, ChatUser } from '../../../core/services/user/chat/chat.service';
import { UserNavComponent } from '../../../shared/user-nav/user-nav.component';
import { Subscription } from 'rxjs';
import { SocketService } from '../../../core/services/user/socket/socket.service';
import { AuthService } from '../../../core/services/user/auth/auth.service';
import { User } from '../../../core/models/userModel';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, UserNavComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('messageContainer') messageContainer!: ElementRef;

  allUsers: User[] = [];
  showUserList: boolean = false;
  isLoadingUsers: boolean = false;
  users: ChatUser[] = [];
  selectedUser: ChatUser | null = null;
  messages: ChatMessage[] = [];
  newMessage: string = '';
  searchTerm: string = '';
  isTyping: boolean = false;
  isLoading: boolean = false;
  isConnecting: boolean = false;
  isSendingMessage: boolean = false;
  error: string = '';
  isMobile = false;
  showMobileSidebar = true;

  private subscriptions: Subscription[] = [];
  private typingTimeout: any;
  private shouldScrollToBottom: boolean = false;
  public isInitialized: boolean = false;
  private currentUserId: string = '';
  private pendingMessages: Map<string, ChatMessage> = new Map();
  private processedMessageIds: Set<string> = new Set();

  constructor(
    private chatService: ChatService,
    public socketService: SocketService,
    private authService: AuthService
  ) {
    this.checkIsMobile();
  }

  async ngOnInit() {
    this.isLoading = true;

    try {
      await this.initializeChat();
      this.loadAllUsers();
      this.loadPersonalChats();
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      this.error = 'Failed to initialize chat. Please refresh the page.';
      this.isLoading = false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private checkIsMobile(): void {
    this.isMobile = window.innerWidth < 1024;
  }

  getSidebarClass(): string {
    if (this.isMobile) {
      return this.showMobileSidebar ? 'fixed inset-y-0 left-0 z-50' : 'hidden';
    }
    return '';
  }

  closeMobileChat(): void {
    if (this.isMobile) {
      this.showMobileSidebar = false;
    }
  }

  private async initializeChat(): Promise<void> {
    this.isConnecting = true;
    this.error = '';

    try {
      const authResponse = await this.authService.checkAuthStatus().toPromise();

      if (!authResponse?.isAuthenticated || !authResponse.user?.id) {
        throw new Error('User not authenticated');
      }

      this.currentUserId = authResponse.user.id;
      this.chatService.setCurrentUserId(authResponse.user.id);

      const token = authResponse.token;
      if (!token) {
        throw new Error('No authentication token found');
      }

      await this.socketService.connect(token);
      await this.socketService.waitForConnection();
      await this.chatService.initialize(this.socketService);

      this.subscribeToRealTimeEvents();

      this.isInitialized = true;
      this.isConnecting = false;
    } catch (error) {
      console.error('Chat initialization failed:', error);
      this.isConnecting = false;
      this.isLoading = false;
      this.error = this.getErrorMessage(error);
      throw error;
    }
  }

  loadAllUsers() {
    this.isLoadingUsers = true;
    this.error = '';

    const usersSub = this.chatService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
        this.isLoadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error = 'Failed to load users. Please try again.';
        this.isLoadingUsers = false;
      }
    });

    this.subscriptions.push(usersSub);
  }

  toggleUserList() {
    this.showUserList = !this.showUserList;
    if (this.showUserList && this.allUsers.length === 0) {
      this.loadAllUsers();
    }
  }

  async startChatWithUser(user: User) {
    try {
      this.isLoading = true;
      this.error = '';

      if (!user.id) {
        throw new Error('User ID is undefined');
      }

      const existingChat = await this.chatService.getChatBetweenUsers(user.id).toPromise();

      if (existingChat) {
        const chatUser: ChatUser = {
          id: user.id,
          name: user.name,
          lastMessage: existingChat.lastMessage?.content || 'No messages yet',
          lastMessageTime: existingChat.lastMessageAt ? new Date(existingChat.lastMessageAt) : new Date(),
          isOnline: true,
          unreadCount: 0,
          chatId: existingChat._id,
          profileImg: user.profileImg
        };

        this.users = [chatUser, ...this.users.filter(u => u.id !== user.id)];
        this.selectUser(chatUser);
      } else {
        const newChat = await this.chatService.createOrGetPersonalChat(user.id).toPromise();
        if (!newChat) {
          throw new Error("Failed to create new chat");
        }

        const chatUser: ChatUser = {
          id: user.id,
          name: user.name,
          lastMessage: 'No messages yet',
          lastMessageTime: new Date(),
          isOnline: true,
          unreadCount: 0,
          chatId: newChat._id,
          profileImg: user.profileImg
        };

        this.users = [chatUser, ...this.users.filter(u => u.id !== user.id)];
        this.selectUser(chatUser);
      }

      this.showUserList = false;
      
      if (this.isMobile) {
        this.showMobileSidebar = false;
      }
      
      this.isLoading = false;
    } catch (error) {
      console.error('Error starting chat:', error);
      this.error = 'Failed to start chat. Please try again.';
      this.isLoading = false;
    }
  }

  private getErrorMessage(error: any): string {
    if (error?.message) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unexpected error occurred';
  }

  getFilteredAllUsers() {
    if (!this.searchTerm) return this.allUsers;
    return this.allUsers.filter(user =>
      user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  private subscribeToRealTimeEvents() {
    const connectionSub = this.socketService.connectionStatus$.subscribe(connected => {
      if (!connected && this.isInitialized) {
        this.error = 'Connection lost. Attempting to reconnect...';
      } else if (connected && this.error.includes('Connection lost')) {
        this.error = '';
      }
    });

    const newMessageSub = this.socketService.listen<any>('newMessage').subscribe(data => {
      this.handleIncomingMessage(data);
    });

    const messageSentSub = this.socketService.listen<any>('messageSent').subscribe(data => {
      this.isSendingMessage = false;
    });

    const joinedChatSub = this.socketService.listen<any>('joinedChat').subscribe();

    const userTypingSub = this.socketService.listen<any>('userTyping').subscribe(data => {
      if (this.selectedUser && data.chatId === this.selectedUser.chatId &&
        data.userId !== this.currentUserId) {
        this.isTyping = true;
      }
    });

    const userStoppedTypingSub = this.socketService.listen<any>('userStoppedTyping').subscribe(data => {
      if (this.selectedUser && data.chatId === this.selectedUser.chatId) {
        this.isTyping = false;
      }
    });

    const userStatusSub = this.socketService.listen<any>('userStatus').subscribe(data => {
      this.updateUserStatus(data.userId, data.status);
    });

    const errorSub = this.socketService.listen<any>('error').subscribe(error => {
      console.error('Socket error:', error);
      this.error = error.message || 'An error occurred';
    });

    const authenticatedSub = this.socketService.listen<any>('authenticated').subscribe();

    this.subscriptions.push(
      connectionSub,
      newMessageSub,
      messageSentSub,
      joinedChatSub,
      userTypingSub,
      userStoppedTypingSub,
      userStatusSub,
      errorSub,
      authenticatedSub
    );
  }

  private handleIncomingMessage(data: any) {
    const message: ChatMessage = {
      id: data.message.id || data.message._id,
      senderId: data.message.senderId || data.message.sender?._id,
      content: data.message.content,
      timestamp: new Date(data.message.timestamp),
      createdAt: new Date(data.message.createdAt || data.message.timestamp),
      isRead: data.message.isRead || false,
      type: data.message.type || 'text',
      messageType: data.message.messageType || 'text'
    };

    const existingIndex = this.messages.findIndex(msg =>
      msg.id === message.id ||
      (msg.id.toString().startsWith('temp-') && msg.content === message.content && Math.abs(new Date(msg.timestamp).getTime() - new Date(message.timestamp).getTime()) < 5000)
    );

    if (existingIndex !== -1) {
      this.messages[existingIndex] = message;
    } else {
      this.messages = [...this.messages, message];
    }

    this.shouldScrollToBottom = true;
    this.updateUserLastMessage(data.chatId, message);
  }

  private handleMessageSentConfirmation(data: any) {
    this.isSendingMessage = false;
  }

  private handleMessageSendError(tempId: string) {
    this.isSendingMessage = false;

    if (tempId && this.pendingMessages.has(tempId)) {
      const failedMessage = this.pendingMessages.get(tempId);
      this.pendingMessages.delete(tempId);

      this.messages = this.messages.filter(msg => msg.id !== tempId);

      if (failedMessage) {
        this.newMessage = failedMessage.content;
      }

      this.error = 'Failed to send message. Please try again.';
    }
  }

  private updateUserLastMessage(chatId: string, message: ChatMessage) {
    const userIndex = this.users.findIndex(user => user.chatId === chatId);
    if (userIndex !== -1) {
      this.users[userIndex] = {
        ...this.users[userIndex],
        lastMessage: message.content,
        lastMessageTime: message.createdAt ?? new Date(),
        unreadCount: this.users[userIndex].id === this.selectedUser?.id ?
          this.users[userIndex].unreadCount : this.users[userIndex].unreadCount + 1
      };

      this.users.sort((a, b) =>
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );
    }
  }

  private updateUserListAfterMessage(chatId: string, message: ChatMessage) {
    const userIndex = this.users.findIndex(user => user.chatId === chatId);
    if (userIndex !== -1) {
      this.users[userIndex] = {
        ...this.users[userIndex],
        lastMessage: message.content,
        lastMessageTime: message.createdAt ?? new Date(),
        unreadCount: this.users[userIndex].unreadCount + 1
      };

      this.users.sort((a, b) =>
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );
    }
  }

  private updateUserStatus(userId: string, status: string) {
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex] = {
        ...this.users[userIndex],
        isOnline: status === 'online'
      };
    }
  }

  loadPersonalChats() {
    if (!this.isInitialized) {
      console.warn('Chat not initialized, skipping loadPersonalChats');
      return;
    }

    if (!this.isLoading) {
      this.isLoading = true;
    }

    this.error = '';

    const usersSub = this.chatService.getPersonalChats().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;

        if (this.users.length > 0 && !this.selectedUser) {
          this.selectUser(this.users[0]);
        }
      },
      error: (error) => {
        console.error('Error loading personal chats:', error);
        this.error = 'Failed to load chats. Please try again.';
        this.isLoading = false;
      }
    });

    this.subscriptions.push(usersSub);
  }

  async selectUser(user: ChatUser) {
    if (this.selectedUser?.id === user.id) return;

    if (!this.socketService.isConnected()) {
      this.error = 'Connection lost. Please wait while we reconnect...';
      return;
    }

    this.selectedUser = user;
    this.messages = [];
    this.processedMessageIds.clear();
    this.isLoading = true;
    this.error = '';
    this.isTyping = false;

    if (this.isMobile) {
      this.showMobileSidebar = false;
    }

    if (user.chatId) {
      try {
        await this.socketService.emit('joinChat', { chatId: user.chatId });

        const messagesSub = this.chatService.getChatMessages(user.chatId).subscribe({
          next: (messages) => {
            this.messages = messages.map(msg => ({
              ...msg,
              senderId: msg.senderId
            }));

            messages.forEach(msg => this.processedMessageIds.add(msg.id));

            this.isLoading = false;
            this.shouldScrollToBottom = true;

            if (user.unreadCount > 0) {
              this.markMessagesAsRead(user.chatId!);
            }
          },
          error: (error) => {
            console.error('Error loading messages:', error);
            this.error = 'Failed to load messages. Please try again.';
            this.isLoading = false;
          }
        });
        this.subscriptions.push(messagesSub);
      } catch (error) {
        console.error('Error joining chat:', error);
        this.error = 'Failed to join chat. Please try again.';
        this.isLoading = false;
      }
    }
  }

  async sendMessage() {
    if (!this.newMessage.trim() || !this.selectedUser?.chatId || this.isSendingMessage) return;

    if (!this.socketService.isConnected()) {
      this.error = 'Cannot send message. Connection lost.';
      return;
    }

    const content = this.newMessage.trim();
    this.newMessage = '';
    this.isSendingMessage = true;

    if (this.selectedUser?.chatId) {
      await this.socketService.emit('stopTyping', { chatId: this.selectedUser.chatId });
    }

    try {
      const tempId = 'temp-' + Date.now() + '-' + Math.random();
      const optimisticMessage: ChatMessage = {
        id: tempId,
        content: content,
        senderId: this.currentUserId,
        timestamp: new Date(),
        createdAt: new Date(),
        isRead: false,
        type: 'text'
      };

      this.pendingMessages.set(tempId, optimisticMessage);

      this.messages = [...this.messages, optimisticMessage];
      this.shouldScrollToBottom = true;

      await this.socketService.emit('sendMessage', {
        chatId: this.selectedUser.chatId,
        content: content,
        senderId: this.currentUserId,
        tempId: tempId
      });

    } catch (error) {
      console.error('Error sending message:', error);
      this.error = 'Failed to send message. Please try again.';
      this.newMessage = content;
      this.isSendingMessage = false;

      this.messages = this.messages.filter(msg => !msg.id.toString().startsWith('temp-'));
    }
  }

  async onMessageInput() {
    if (this.selectedUser?.chatId && this.socketService.isConnected()) {
      try {
        await this.socketService.emit('typing', { chatId: this.selectedUser.chatId });

        if (this.typingTimeout) {
          clearTimeout(this.typingTimeout);
        }

        this.typingTimeout = setTimeout(async () => {
          if (this.selectedUser?.chatId) {
            await this.socketService.emit('stopTyping', { chatId: this.selectedUser.chatId });
          }
        }, 2000);
      } catch (error) {
        console.error('Error sending typing indicator:', error);
      }
    }
  }

  markMessagesAsRead(chatId: string) {
    this.chatService.markMessagesAsRead(chatId).subscribe({
      next: () => {
        if (this.selectedUser && this.selectedUser.chatId === chatId) {
          this.selectedUser.unreadCount = 0;
        }
      },
      error: (error) => {
        console.error('Error marking messages as read:', error);
      }
    });
  }

  getFilteredUsers() {
    if (!this.searchTerm) return this.users;

    return this.users.filter(user =>
      user.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

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

  private scrollToBottom() {
    try {
      if (this.messageContainer?.nativeElement) {
        const element = this.messageContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  isCurrentUserMessage(message: ChatMessage): boolean {
    return message.senderId === this.currentUserId;
  }

  async refreshChats() {
    this.isLoading = true;
    this.error = '';

    try {
      if (!this.socketService.isConnected() || !this.isInitialized) {
        await this.initializeChat();
      }

      this.loadPersonalChats();

      if (this.selectedUser?.chatId) {
        await this.selectUser(this.selectedUser);
      }

    } catch (error) {
      console.error('Failed to refresh chats:', error);
      this.error = 'Failed to refresh. Please try again.';
      this.isLoading = false;
    }
  }

  trackByUserId(index: number, user: User | ChatUser): string {
    if(user.id){
    return user.id;
    }else{
      return ''
    }

  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 1024;
    
    if (!this.isMobile) {
      this.showMobileSidebar = true;
    }
  }

  adjustTextareaHeight(event: any): void {
    const textarea = event.target;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
    }
  }

  clearError(): void {
    this.error = '';
  }

  hasUnreadMessages(user: ChatUser): boolean {
    return user.unreadCount > 0;
  }

  getUnreadCountText(count: number): string {
    return count > 99 ? '99+' : count.toString();
  }

  async retryConnection() {
    this.error = '';
    this.isLoading = true;

    try {
      await this.retryInitialization();
    } catch (error) {
      console.error('Retry failed after multiple attempts:', error);
      this.error = 'Connection failed. Please check your internet connection and try again.';
      this.isLoading = false;
    }
  }

  getUserInitials(name: string): string {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  }

  private async retryInitialization(maxRetries: number = 3): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Initialization attempt ${attempt}/${maxRetries}`);
        await this.initializeChat();
        this.loadPersonalChats();
        return;
      } catch (error) {
        console.error(`Initialization attempt ${attempt} failed:`, error);

        if (attempt === maxRetries) {
          throw new Error(`Failed to initialize after ${maxRetries} attempts`);
        }

        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
}