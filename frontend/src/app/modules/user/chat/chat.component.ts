import { AfterViewChecked, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage, ChatService, ChatUser } from '../../../core/services/user/chat/chat.service';
import { UserNavComponent } from '../../../shared/user-nav/user-nav.component';
import { Subscription } from 'rxjs';
import { SocketService } from '../../../core/services/user/socket/socket.service';
import { AuthService } from '../../../core/services/user/auth/auth.service';
import { User } from '../../../core/models/userModel';
import { ChatHelperService } from '../../../core/services/utility/chat-helper.service';

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
  users: ChatUser[] = [];
  messages: ChatMessage[] = [];
  selectedUser: ChatUser | null = null;

  newMessage: string = '';
  searchTerm: string = '';

  showUserList: boolean = false;
  isMobile = false;
  showMobileSidebar = true;

  isLoadingUsers: boolean = false;
  isLoading: boolean = false;
  isConnecting: boolean = false;
  isSendingMessage: boolean = false;
  isTyping: boolean = false;
  isInitialized: boolean = false;

  error: string = '';

  private shouldScrollToBottom: boolean = false;
  private currentUserId: string = '';
  private pendingMessages: Map<string, ChatMessage> = new Map();

  constructor(
    private chatService: ChatService,
    public socketService: SocketService,
    private authService: AuthService,
    private chatHelper: ChatHelperService
  ) {
    this.isMobile = this.chatHelper.checkIsMobile();
  }

  async ngOnInit() {
    this.isLoading = true;
    try {
      await this.initializeChat();
      this.loadAllUsers();
      this.loadPersonalChats();
    } catch (error) {
      this.handleError('Failed to initialize chat. Please refresh the page.', error);
    }
  }

  ngOnDestroy() {
    this.chatHelper.unsubscribeAll();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messageContainer?.nativeElement) {
        const element = this.messageContainer.nativeElement;
        setTimeout(() => {
          element.scrollTop = element.scrollHeight;
        }, 0);
      }
    } catch (error) {
      console.error('Error scrolling to bottom:', error);
    }
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

  toggleUserList() {
    this.showUserList = !this.showUserList;
    if (this.showUserList && this.allUsers.length === 0) {
      this.loadAllUsers();
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

      this.subscribeToSocketEvents();

      this.isInitialized = true;
      this.isConnecting = false;
    } catch (error) {
      this.isConnecting = false;
      this.isLoading = false;
      this.error = this.chatHelper.getErrorMessage(error);
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
      error: (error) => this.handleError('Failed to load users. Please try again.', error, () => {
        this.isLoadingUsers = false;
      })
    });

    this.chatHelper.addSubscription(usersSub);
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
      error: (error) => this.handleError('Failed to load chats. Please try again.', error, () => {
        this.isLoading = false;
      })
    });

    this.chatHelper.addSubscription(usersSub);
  }

  private subscribeToSocketEvents() {
    const subscriptions = [
      this.socketService.connectionStatus$.subscribe(connected => {
        if (!connected && this.isInitialized) {
          this.error = 'Connection lost. Attempting to reconnect...';
        } else if (connected && this.error.includes('Connection lost')) {
          this.error = '';
        }
      }),

      this.socketService.listen<any>('newMessage').subscribe(data => {
        this.handleIncomingMessage(data);
      }),

      this.socketService.listen<any>('messageSent').subscribe((data) => {
        this.isSendingMessage = false;
        
        if (data.tempId) {
          this.pendingMessages.delete(data.tempId);
          const realMessage = this.chatHelper.createChatMessage(data);
          this.messages = this.chatHelper.updateMessageInList(
            this.messages.filter(m => m.id !== data.tempId), 
            realMessage,
            this.selectedUser?.chatId
          );
        }
      }),

      this.socketService.listen<any>('userTyping').subscribe(data => {
        if (this.selectedUser && data.chatId === this.selectedUser.chatId &&
          data.userId !== this.currentUserId) {
          this.isTyping = true;
        }
      }),

      this.socketService.listen<any>('userStoppedTyping').subscribe(data => {
        if (this.selectedUser && data.chatId === this.selectedUser.chatId) {
          this.isTyping = false;
        }
      }),

      this.socketService.listen<any>('userStatus').subscribe(data => {
        this.users = this.chatHelper.updateUserStatus(this.users, data.userId, data.status === 'online');
      }),

      this.socketService.listen<any>('error').subscribe(error => {
        this.handleError(error.message || 'An error occurred', error);
      })
    ];

    subscriptions.forEach(sub => this.chatHelper.addSubscription(sub));
  }

  private handleIncomingMessage(data: any) {
    const message = this.chatHelper.createChatMessage(data);
    
    if (this.selectedUser?.chatId === data.chatId) {
      this.messages = this.chatHelper.updateMessageInList(
        this.messages, 
        message, 
        this.selectedUser?.chatId
      );
      
      this.shouldAutoScroll();
    }

    this.users = this.chatHelper.updateUserLastMessage(
      this.users, 
      data.chatId, 
      message,
      this.currentUserId,
      this.selectedUser?.chatId
    );
  }

  private shouldAutoScroll(): void {
    if (!this.messageContainer?.nativeElement) {
      this.shouldScrollToBottom = true;
      return;
    }

    const element = this.messageContainer.nativeElement;
    const threshold = 100;
    const isNearBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - threshold;

    this.shouldScrollToBottom = isNearBottom;
  }

  async selectUser(user: ChatUser) {
    if (this.selectedUser?.id === user.id) return;

    if (!this.socketService.isConnected()) {
      this.error = 'Connection lost. Please wait while we reconnect...';
      return;
    }

    this.users = this.chatHelper.clearUnreadCount(this.users, user.chatId || '');
    
    this.selectedUser = user;
    this.messages = [];
    this.isLoading = true;
    this.error = '';
    this.isTyping = false;

    if (this.isMobile) {
      this.showMobileSidebar = false;
    }

    if (user.chatId) {
      try {
        await this.socketService.emit('joinChat', { chatId: user.chatId });
        await this.loadChatMessages(user.chatId);

        this.markMessagesAsRead(user.chatId);
      } catch (error) {
        this.handleError('Failed to join chat. Please try again.', error);
      }
    }
  }

  private async loadChatMessages(chatId: string) {
    const messagesSub = this.chatService.getChatMessages(chatId).subscribe({
      next: (messages) => {
        this.messages = messages.map(msg => ({ ...msg, senderId: msg.senderId }));
        this.isLoading = false;
        this.shouldScrollToBottom = true;
      },
      error: (error) => this.handleError('Failed to load messages. Please try again.', error)
    });

    this.chatHelper.addSubscription(messagesSub);
  }

  async startChatWithUser(user: User) {
    try {
      this.isLoading = true;
      this.error = '';

      if (!this.chatHelper.isValidUser(user)) {
        throw new Error('Invalid user data');
      }

      const existingChat = await this.chatService.getChatBetweenUsers(user.id ?? '').toPromise();
      const chatUser = this.chatHelper.createChatUser(user, existingChat);

      if (!existingChat) {
        const newChat = await this.chatService.createOrGetPersonalChat(user.id ?? '').toPromise();
        if (!newChat) {
          throw new Error("Failed to create new chat");
        }
        chatUser.chatId = newChat._id;
      }

      this.users = this.chatHelper.updateUserInList(this.users, chatUser);
      this.selectUser(chatUser);
      this.showUserList = false;

      if (this.isMobile) {
        this.showMobileSidebar = false;
      }

      this.isLoading = false;
    } catch (error) {
      this.handleError('Failed to start chat. Please try again.', error);
    }
  }

  async sendMessage() {
    if (!this.chatHelper.isValidMessage(this.newMessage) ||
      !this.selectedUser?.chatId ||
      this.isSendingMessage) return;

    if (!this.socketService.isConnected()) {
      this.error = 'Cannot send message. Connection lost.';
      return;
    }

    const content = this.newMessage.trim();
    this.newMessage = '';
    this.isSendingMessage = true;

    try {
      await this.socketService.emit('stopTyping', { chatId: this.selectedUser.chatId });

      const optimisticMessage = this.chatHelper.createOptimisticMessage(content, this.currentUserId);
      this.pendingMessages.set(optimisticMessage.id, optimisticMessage);
      this.messages = [...this.messages, optimisticMessage];

      this.shouldScrollToBottom = true;

      await this.socketService.emit('sendMessage', {
        chatId: this.selectedUser.chatId,
        content: content,
        senderId: this.currentUserId,
        tempId: optimisticMessage.id
      });

    } catch (error) {
      this.handleError('Failed to send message. Please try again.', error, () => {
        this.newMessage = content;
        this.isSendingMessage = false;
        this.messages = this.messages.filter(msg => !msg.id.toString().startsWith('temp-'));
      });
    }
  }

  async onMessageInput() {
    if (this.selectedUser?.chatId && this.socketService.isConnected()) {
      try {
        await this.socketService.emit('typing', { chatId: this.selectedUser.chatId });
        this.chatHelper.startTypingIndicator(async () => {
          if (this.selectedUser?.chatId) {
            await this.socketService.emit('stopTyping', { chatId: this.selectedUser.chatId });
          }
        });
      } catch (error) {
        console.error('Error sending typing indicator:', error);
      }
    }
  }

  markMessagesAsRead(chatId: string) {
    this.chatService.markMessagesAsRead(chatId).subscribe({
      next: () => {
        console.log('Messages marked as read on server');
      },
      error: (error) => console.error('Error marking messages as read:', error)
    });
  }

  getFilteredUsers() {
    return this.chatHelper.filterChatUsers(this.users, this.searchTerm);
  }

  getFilteredAllUsers() {
    return this.chatHelper.filterUsers(this.allUsers, this.searchTerm);
  }

  isCurrentUserMessage(message: ChatMessage): boolean {
    return message.senderId === this.currentUserId;
  }

  hasUnreadMessages(user: ChatUser): boolean {
    return user.unreadCount > 0;
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 1024;
    if (!this.isMobile) {
      this.showMobileSidebar = true;
    }
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
      this.handleError('Failed to refresh. Please try again.', error);
    }
  }

  async retryConnection() {
    this.error = '';
    this.isLoading = true;

    try {
      await this.chatHelper.retryWithBackoff(async () => {
        await this.initializeChat();
        this.loadPersonalChats();
      });
    } catch (error) {
      this.handleError('Connection failed. Please check your internet connection and try again.', error);
    }
  }

  formatTime = (date: Date) => this.chatHelper.formatTime(date);
  formatLastMessageTime = (date: Date) => this.chatHelper.formatLastMessageTime(date);
  getUserInitials = (name: string) => this.chatHelper.getUserInitials(name);
  getUnreadCountText = (count: number) => this.chatHelper.getUnreadCountText(count);
  adjustTextareaHeight = (event: any) => this.chatHelper.adjustTextareaHeight(event);
  trackByUserId = (index: number, user: User | ChatUser) => this.chatHelper.trackByUserId(index, user);
  trackByMessageId = (index: number, message: ChatMessage) => this.chatHelper.trackByMessageId(index, message);

  clearError(): void {
    this.error = '';
  }

  private handleError(message: string, error?: any, callback?: () => void) {
    console.error(message, error);
    this.error = message;
    this.isLoading = false;
    if (callback) callback();
  }
}