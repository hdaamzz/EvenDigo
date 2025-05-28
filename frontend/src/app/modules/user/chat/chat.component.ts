import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage, ChatSection, ChatService, ChatUser } from '../../../core/services/user/chat/chat.service';
import { UserNavComponent } from "../../../shared/user-nav/user-nav.component";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule, UserNavComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('messageContainer') messageContainer!: ElementRef;

  activeSection: ChatSection = 'personal';
  chatSections = [
    { key: 'personal' as ChatSection, label: 'Personal', icon: 'pi pi-user' },
    { key: 'events' as ChatSection, label: 'Events', icon: 'pi pi-calendar' }
  ];

  users: ChatUser[] = [];
  selectedUser: ChatUser | null = null;
  messages: ChatMessage[] = [];
  newMessage: string = '';
  searchTerm: string = '';
  isTyping: boolean = false;
  isLoading: boolean = false;
  error: string = '';

  private subscriptions: Subscription[] = [];

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    this.loadUsers();
    this.subscribeToMessages();
    this.subscribeToUnreadCount();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private subscribeToMessages() {
    const messagesSub = this.chatService.messages$.subscribe(messages => {
      this.messages = messages;
    });
    this.subscriptions.push(messagesSub);
  }

  private subscribeToUnreadCount() {
    const unreadSub = this.chatService.unreadCount$.subscribe(count => {
      // You can use this for notifications or badge counts
      console.log('Unread count:', count);
    });
    this.subscriptions.push(unreadSub);
  }

  loadUsers() {
    this.isLoading = true;
    this.error = '';

    const usersSub = this.chatService.getUsersBySection(this.activeSection).subscribe({
      next: (users) => {
        this.users = users.sort((a, b) =>
          new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        );
        this.isLoading = false;

        // Auto-select first user if none selected and users exist
        if (this.users.length > 0 && !this.selectedUser) {
          this.selectUser(this.users[0]);
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error = 'Failed to load chats. Please try again.';
        this.isLoading = false;
      }
    });

    this.subscriptions.push(usersSub);
  }

  switchSection(section: ChatSection) {
    this.activeSection = section;
    this.selectedUser = null;
    this.messages = [];
    this.loadUsers();
  }

  selectUser(user: ChatUser) {
    if (this.selectedUser?.id === user.id) return;

    this.selectedUser = user;
    this.messages = [];
    this.isLoading = true;
    this.error = '';

    if (user.chatId) {
      const messagesSub = this.chatService.getChatMessages(user.chatId).subscribe({
        next: (messages) => {
          this.messages = messages;
          this.isLoading = false;

          // Mark messages as read
          this.markMessagesAsRead(user.chatId!);
        },
        error: (error) => {
          console.error('Error loading messages:', error);
          this.error = 'Failed to load messages. Please try again.';
          this.isLoading = false;
        }
      });

      this.subscriptions.push(messagesSub);
    }
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedUser?.chatId) return;

    const content = this.newMessage.trim();
    this.newMessage = '';

    const sendSub = this.chatService.sendMessage(this.selectedUser.chatId, content).subscribe({
      next: (message) => {
        // Add message to local messages array
        this.messages.push(message);

        // Update user's last message
        if (this.selectedUser) {
          this.selectedUser.lastMessage = content;
          this.selectedUser.lastMessageTime = new Date();
        }

        // Refresh user list to update order
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.error = 'Failed to send message. Please try again.';
        // Restore the message in input
        this.newMessage = content;
      }
    });

    this.subscriptions.push(sendSub);
  }

  markMessagesAsRead(chatId: string) {
    const readSub = this.chatService.markMessagesAsRead(chatId).subscribe({
      next: () => {
        // Update local messages as read
        this.messages.forEach(msg => {
          if (msg.senderId !== this.chatService.getCurrentUserId()) {
            msg.isRead = true;
          }
        });

        // Update user's unread count
        if (this.selectedUser) {
          this.selectedUser.unreadCount = 0;
        }
      },
      error: (error) => {
        console.error('Error marking messages as read:', error);
      }
    });

    this.subscriptions.push(readSub);
  }

  getFilteredUsers() {
    if (!this.searchTerm) return this.users;
    return this.users.filter(user =>
      user.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  }

  formatLastMessageTime(date: Date): string {
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
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
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

  // Utility method to check if message is from current user
  isCurrentUserMessage(message: ChatMessage): boolean {
    return message.senderId === this.chatService.getCurrentUserId();
  }

  // Refresh chats manually
  refreshChats() {
    this.loadUsers();
    if (this.selectedUser?.chatId) {
      this.selectUser(this.selectedUser);
    }
  }

  // Join event chat
  joinEventChat(eventId: string) {
    const joinSub = this.chatService.joinEventChat(eventId).subscribe({
      next: (chat) => {
        console.log('Joined event chat:', chat);
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error joining event chat:', error);
        this.error = 'Failed to join event chat.';
      }
    });

    this.subscriptions.push(joinSub);
  }

  // Leave event chat
  leaveEventChat(eventId: string) {
    const leaveSub = this.chatService.leaveEventChat(eventId).subscribe({
      next: () => {
        console.log('Left event chat');
        this.loadUsers();
        if (this.selectedUser?.eventId === eventId) {
          this.selectedUser = null;
          this.messages = [];
        }
      },
      error: (error) => {
        console.error('Error leaving event chat:', error);
        this.error = 'Failed to leave event chat.';
      }
    });

    this.subscriptions.push(leaveSub);
  }
  trackByUserId(index: number, user: ChatUser): string {
    return user.id;
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }

  closeMobileChat(): void {
    this.selectedUser = null;
  }

  adjustTextareaHeight(event: any): void {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
  }
}