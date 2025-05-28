import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage, ChatSection, ChatService, ChatUser } from '../../../core/services/user/chat/chat.service';
import { UserNavComponent } from "../../../shared/user-nav/user-nav.component";

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule, UserNavComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, AfterViewChecked {
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

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.loadUsers();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  loadUsers() {
    this.users = this.chatService.getUsersBySection(this.activeSection);
    if (this.users.length > 0 && !this.selectedUser) {
      this.selectUser(this.users[0]);
    }
  }

  switchSection(section: ChatSection) {
    this.activeSection = section;
    this.selectedUser = null;
    this.messages = [];
    this.loadUsers();
  }

  selectUser(user: ChatUser) {
    this.selectedUser = user;
    this.messages = this.chatService.getMessagesForUser(user.id);
    // Mark messages as read
    this.chatService.markMessagesAsRead(user.id);
    this.loadUsers(); // Refresh to update unread counts
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedUser) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'current-user',
      receiverId: this.selectedUser.id,
      content: this.newMessage,
      timestamp: new Date(),
      isRead: false,
      type: 'text'
    };

    this.chatService.sendMessage(message);
    this.messages = this.chatService.getMessagesForUser(this.selectedUser.id);
    this.newMessage = '';

    // Simulate typing indicator and auto-response
    this.simulateResponse();
  }

  simulateResponse() {
    if (!this.selectedUser) return;
    
    this.isTyping = true;
    setTimeout(() => {
      this.isTyping = false;
      const responses = [
        "Thanks for your message!",
        "I'll get back to you shortly.",
        "That sounds great!",
        "Let me check on that for you.",
        "Absolutely, I agree!"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: this.selectedUser!.id,
        receiverId: 'current-user',
        content: randomResponse,
        timestamp: new Date(),
        isRead: true,
        type: 'text'
      };

      this.chatService.sendMessage(response);
      this.messages = this.chatService.getMessagesForUser(this.selectedUser!.id);
    }, 2000);
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
}