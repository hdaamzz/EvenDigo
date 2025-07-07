import { AfterViewChecked, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/user/chat/chat.service';
import { UserNavComponent } from '../../../shared/user-nav/user-nav.component';
import { SocketService } from '../../../core/services/user/socket/socket.service';
import { AuthService } from '../../../core/services/user/auth/auth.service';
import { User } from '../../../core/models/userModel';
import { ChatHelperService } from '../../../core/services/utility/chat-helper.service';
import { ChatItem, ChatMessage, ChatUser, GroupChat } from '../../../core/interfaces/user/chat';
import { ActivatedRoute } from '@angular/router';

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
  personalChats: ChatUser[] = [];
  groupChats: GroupChat[] = [];
  combinedChats: ChatItem[] = [];
  messages: ChatMessage[] = [];
  selectedChat: ChatItem | null = null;
  currentChatType: 'personal' | 'group' = 'personal';

  newMessage: string = '';
  searchTerm: string = '';
  activeChatTab: 'personal' | 'group' = 'personal';

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
  totalUnreadCount: number = 0;

  private shouldScrollToBottom: boolean = false;
  private currentUserId: string = '';
  private pendingMessages: Map<string, ChatMessage> = new Map();

  constructor(
    private chatService: ChatService,
    public socketService: SocketService,
    private authService: AuthService,
    private chatHelper: ChatHelperService,
    private route: ActivatedRoute
  ) {
    this.isMobile = this.chatHelper.checkIsMobile();
  }

  async ngOnInit() {
    this.isLoading = true;
    try {
      await this.initializeChat();
      this.loadAllUsers();
      this.loadChats();
      this.subscribeToUnreadCount();
      this.route.queryParams.subscribe(params => {
      if (params['userId']) {
        this.handleDirectChatNavigation(params['userId']);
      }
    });
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

  private async handleDirectChatNavigation(userId: string) {
  try {
    
     this.chatService.getAllUsers().subscribe((response)=>{
       let allUser:any=response
       let targetUser = allUser.find((user: { id: string; }) => user.id === userId);
       if (!targetUser) {
           this.startChatWithUserId(userId);
          return;
       }
        this.startChatWithUser(targetUser);
      
     
    });

  } catch (error) {
    this.handleError('Failed to start chat with organizer', error);
  }
}

private async startChatWithUserId(userId: string) {
  try {
    this.isLoading = true;
    this.error = '';


    const existingChat = await this.chatService.getChatBetweenUsers(userId).toPromise();
    
    if (existingChat) {
      const chatItem: ChatItem = {
        id: userId,
        name: 'Organizer', 
        username: 'organizer',
        lastMessage: '',
        lastMessageTime: new Date(),
        isOnline: false,
        unreadCount: 0,
        chatId: existingChat._id,
        chatType: 'personal'
      };
      
      this.selectChat(chatItem);
    } else {
      const newChat = await this.chatService.createOrGetPersonalChat(userId).toPromise();
      if (newChat) {
        const chatItem: ChatItem = {
          id: userId,
          name: 'Organizer',
          username: 'organizer',
          lastMessage: '',
          lastMessageTime: new Date(),
          isOnline: false,
          unreadCount: 0,
          chatId: newChat._id,
          chatType: 'personal'
        };
        
        this.selectChat(chatItem);
      }
    }
    
    this.isLoading = false;
  } catch (error) {
    this.handleError('Failed to start chat', error);
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

  private subscribeToUnreadCount(): void {
    const unreadSub = this.chatService.unreadCount$.subscribe(count => {
      this.totalUnreadCount = count;
    });
    this.chatHelper.addSubscription(unreadSub);
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

  switchChatTab(tab: 'personal' | 'group') {
    this.activeChatTab = tab;
    this.searchTerm = '';
    this.updateCombinedChats();
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
      this.subscribeToChats();

      this.isInitialized = true;
      this.isConnecting = false;
    } catch (error) {
      this.isConnecting = false;
      this.isLoading = false;
      this.error = this.chatHelper.getErrorMessage(error);
      throw error;
    }
  }

  private subscribeToChats(): void {
    const personalChatsSub = this.chatService.chatUsers$.subscribe(personalChats => {
      this.personalChats = personalChats;
      this.updateCombinedChats();
    });

    const groupChatsSub = this.chatService.groupChats$.subscribe(groupChats => {
      this.groupChats = groupChats;
      this.updateCombinedChats();
    });

    this.chatHelper.addSubscription(personalChatsSub);
    this.chatHelper.addSubscription(groupChatsSub);
  }

  private updateCombinedChats(): void {
    const personalChatItems: ChatItem[] = this.personalChats.map(chat => ({
      id: chat.id,
      name: chat.name,
      username: chat.username,
      lastMessage: chat.lastMessage,
      lastMessageTime: chat.lastMessageTime,
      lastSeenTime: chat.lastSeenTime,
      isOnline: chat.isOnline,
      unreadCount: chat.unreadCount,
      profileImg: chat.profileImg,
      chatId: chat.chatId,
      chatType: 'personal' as const
    }));

    const groupChatItems: ChatItem[] = this.groupChats.map(chat => ({
      id: chat.id,
      name: chat.name,
      lastMessage: chat.lastMessage,
      lastMessageTime: chat.lastMessageTime,
      isOnline: true, 
      unreadCount: chat.unreadCount,
      chatId: chat.id,
      chatType: 'group' as const,
      participants: chat.participants,
      eventId: chat.eventId,
      isActive: chat.isActive
    }));

    if (this.activeChatTab === 'personal') {
      this.combinedChats = personalChatItems;
    } else {
      this.combinedChats = groupChatItems;
    }

    this.combinedChats.sort((a, b) =>
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );

    if (this.combinedChats.length > 0 && !this.selectedChat) {
      this.selectChat(this.combinedChats[0]);
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

  loadChats() {
    if (!this.isInitialized) {
      console.warn('Chat not initialized, skipping loadChats');
      return;
    }

    if (!this.isLoading) {
      this.isLoading = true;
    }

    this.error = '';

    const chatsSub = this.chatService.getUserChats().subscribe({
      next: ({ personalChats, groupChats }) => {
        this.personalChats = personalChats;
        this.groupChats = groupChats;
        this.updateCombinedChats();
        this.isLoading = false;
      },
      error: (error) => this.handleError('Failed to load chats. Please try again.', error, () => {
        this.isLoading = false;
      })
    });

    this.chatHelper.addSubscription(chatsSub);
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
            this.selectedChat?.chatId
          );
        }
      }),

      this.socketService.listen<any>('userTyping').subscribe(data => {
        if (this.selectedChat && data.chatId === this.selectedChat.chatId &&
          data.userId !== this.currentUserId) {
          this.isTyping = true;
        }
      }),

      this.socketService.listen<any>('userStoppedTyping').subscribe(data => {
        if (this.selectedChat && data.chatId === this.selectedChat.chatId) {
          this.isTyping = false;
        }
      }),

      this.socketService.listen<any>('userStatus').subscribe(data => {
        this.personalChats = this.chatHelper.updateUserStatus(this.personalChats, data.userId, data.status === 'online');
        this.updateCombinedChats();
      }),

      this.socketService.listen<any>('error').subscribe(error => {
        this.handleError(error.message || 'An error occurred', error);
      }),

      this.socketService.listen<any>('groupChatInfo').subscribe(data => {
        this.loadChats();
      }),

      this.socketService.listen<any>('userJoinedChat').subscribe(data => {
        if (data.chatType === 'group') {
          this.loadChats();
        }
      }),

      this.socketService.listen<any>('userLeftChat').subscribe(data => {
        if (data.chatType === 'group') {
          this.loadChats();
        }
      })
    ];

    subscriptions.forEach(sub => this.chatHelper.addSubscription(sub));
  }

  handleIncomingMessage(data: any) {
    const message = this.chatHelper.createChatMessage(data);

    if (this.selectedChat?.chatId === data.chatId) {
      this.messages = this.chatHelper.updateMessageInList(
        this.messages,
        message,
        this.selectedChat?.chatId
      );

      this.shouldAutoScroll();

      if (message.senderId !== this.currentUserId) {
        this.markMessagesAsRead(data.chatId, data.chatType || 'personal');
      }
    }

    if (data.chatType === 'group') {
      this.groupChats = this.chatHelper.updateGroupChatLastMessage(
        this.groupChats,
        data.chatId,
        message,
        this.currentUserId,
        this.selectedChat?.chatId
      );
    } else {
      this.personalChats = this.chatHelper.updateUserLastMessage(
        this.personalChats,
        data.chatId,
        message,
        this.currentUserId,
        this.selectedChat?.chatId
      );
    }

    this.updateCombinedChats();
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

  async selectChat(chat: ChatItem) {
    if (this.selectedChat?.id === chat.id && this.selectedChat?.chatType === chat.chatType) return;

    if (!this.socketService.isConnected()) {
      this.error = 'Connection lost. Please wait while we reconnect...';
      return;
    }

    if (chat.chatType === 'personal') {
      this.personalChats = this.chatHelper.clearUnreadCount(this.personalChats, chat.chatId || '');
    } else {
      this.groupChats = this.chatHelper.clearGroupChatUnreadCount(this.groupChats, chat.chatId || '');
    }

    chat.unreadCount = 0;

    this.selectedChat = chat;
    this.currentChatType = chat.chatType;
    this.messages = [];
    this.isLoading = true;
    this.error = '';
    this.isTyping = false;

    this.chatService.setChatType(chat.chatType);

    if (this.isMobile) {
      this.showMobileSidebar = false;
    }

    if (chat.chatId) {
      try {
        await this.socketService.emit('joinChat', {
          chatId: chat.chatId,
          chatType: chat.chatType
        });
        await this.loadChatMessages(chat.chatId);

        this.markMessagesAsRead(chat.chatId, chat.chatType);
      } catch (error) {
        this.handleError('Failed to join chat. Please try again.', error);
      }
    }

    this.updateCombinedChats();
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

      this.personalChats = this.chatHelper.updateUserInList(this.personalChats, chatUser);

      this.activeChatTab = 'personal';
      this.updateCombinedChats();

      const chatItem = this.transformChatUserToChatItem(chatUser);
      this.selectChat(chatItem);
      this.showUserList = false;

      if (this.isMobile) {
        this.showMobileSidebar = false;
      }

      this.isLoading = false;
    } catch (error) {
      this.handleError('Failed to start chat. Please try again.', error);
    }
  }

  private transformChatUserToChatItem(chatUser: ChatUser): ChatItem {
    return {
      id: chatUser.id,
      name: chatUser.name,
      username: chatUser.username,
      lastMessage: chatUser.lastMessage,
      lastMessageTime: chatUser.lastMessageTime,
      lastSeenTime: chatUser.lastSeenTime,
      isOnline: chatUser.isOnline,
      unreadCount: chatUser.unreadCount,
      profileImg: chatUser.profileImg,
      chatId: chatUser.chatId,
      chatType: 'personal'
    };
  }

  async sendMessage() {
    if (!this.chatHelper.isValidMessage(this.newMessage) ||
      !this.selectedChat?.chatId ||
      this.isSendingMessage) return;

    if (!this.socketService.isConnected()) {
      this.error = 'Cannot send message. Connection lost.';
      return;
    }

    const content = this.newMessage.trim();
    this.newMessage = '';
    this.isSendingMessage = true;

    try {
      await this.socketService.emit('stopTyping', {
        chatId: this.selectedChat.chatId,
        chatType: this.selectedChat.chatType
      });

      const optimisticMessage = this.chatHelper.createOptimisticMessage(content, this.currentUserId);
      this.pendingMessages.set(optimisticMessage.id, optimisticMessage);
      this.messages = [...this.messages, optimisticMessage];

      if (this.selectedChat.chatType === 'personal') {
        this.personalChats = this.chatHelper.clearUnreadCount(this.personalChats, this.selectedChat.chatId);
      } else {
        this.groupChats = this.chatHelper.clearGroupChatUnreadCount(this.groupChats, this.selectedChat.chatId);
      }

      if (this.selectedChat) {
        this.selectedChat.unreadCount = 0;
      }

      this.updateCombinedChats();

      this.shouldScrollToBottom = true;

      await this.chatService.sendMessage(
        this.selectedChat.chatId,
        content,
        this.selectedChat.chatType
      ).toPromise();

      this.isSendingMessage = false;

    } catch (error) {
      this.handleError('Failed to send message. Please try again.', error, () => {
        this.newMessage = content;
        this.isSendingMessage = false;
        this.messages = this.messages.filter(msg => !msg.id.toString().startsWith('temp-'));
      });
    }
  }

  async onMessageInput() {
    if (this.selectedChat?.chatId && this.socketService.isConnected()) {
      try {
        this.chatService.startTyping(this.selectedChat.chatId, this.selectedChat.chatType);
        this.chatHelper.startTypingIndicator(async () => {
          if (this.selectedChat?.chatId) {
            this.chatService.stopTyping(this.selectedChat.chatId, this.selectedChat.chatType);
          }
        });
      } catch (error) {
        console.error('Error sending typing indicator:', error);
      }
    }
  }

  markMessagesAsRead(chatId: string, chatType: 'personal' | 'group') {
    this.chatService.markMessagesAsRead(chatId, chatType).subscribe({
      next: () => {
        if (chatType === 'personal') {
          this.personalChats = this.chatHelper.clearUnreadCount(this.personalChats, chatId);
        } else {
          this.groupChats = this.chatHelper.clearGroupChatUnreadCount(this.groupChats, chatId);
        }

        if (this.selectedChat?.chatId === chatId) {
          this.selectedChat.unreadCount = 0;
        }

        this.updateCombinedChats();
      },
      error: (error) => console.error('Error marking messages as read:', error)
    });
  }

  getFilteredChats() {
    return this.chatHelper.filterChatItems(this.combinedChats, this.searchTerm);
  }

  getFilteredAllUsers() {
    return this.chatHelper.filterUsers(this.allUsers, this.searchTerm);
  }

  isCurrentUserMessage(message: ChatMessage): boolean {
    return message.senderId === this.currentUserId;
  }

  hasUnreadMessages(chat: ChatItem): boolean {
    return chat.unreadCount > 0;
  }

  getPersonalChatsUnreadCount(): number {
    return this.personalChats.reduce((sum, chat) => sum + chat.unreadCount, 0);
  }

  getGroupChatsUnreadCount(): number {
    return this.groupChats.reduce((sum, chat) => sum + chat.unreadCount, 0);
  }

  getChatDisplayName(chat: ChatItem): string {
    if (chat.chatType === 'group') {
      return chat.name;
    }
    return chat.username || chat.name;
  }

  getChatSubtitle(chat: ChatItem): string {
    if (chat.chatType === 'group') {
      const participantCount = chat.participants?.length || 0;
      return `${participantCount} participant${participantCount !== 1 ? 's' : ''}`;
    }
    return chat.isOnline ? 'Online' : 'Offline';
  }

  getTypingIndicatorText(): string {
    if (this.selectedChat?.chatType === 'group') {
      return 'Someone is typing...';
    }
    return `${this.selectedChat?.name} is typing...`;
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

      this.loadChats();

      if (this.selectedChat?.chatId) {
        await this.selectChat(this.selectedChat);
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
        this.loadChats();
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
  trackByChatId = (index: number, chat: ChatItem) => chat.chatId;

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