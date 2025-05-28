import { Injectable } from '@angular/core';

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
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
}


@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private users: ChatUser[] = [
    // Personal Section
    {
      id: '1',
      name: 'Alice Johnson',
      lastMessage: 'Hey, how are you doing today?',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      isOnline: true,
      unreadCount: 2,
      section: 'personal'
    },
    {
      id: '2',
      name: 'Bob Smith',
      lastMessage: 'Thanks for the help yesterday!',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isOnline: false,
      unreadCount: 0,
      section: 'personal',
      lastSeenTime: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    {
      id: '3',
      name: 'Carol Davis',
      lastMessage: 'Let\'s catch up soon!',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isOnline: true,
      unreadCount: 1,
      section: 'personal'
    },
    {
      id: '4',
      name: 'David Wilson',
      lastMessage: 'Sure, I\'ll send it over',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      isOnline: false,
      unreadCount: 0,
      section: 'personal',
      lastSeenTime: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6 hours ago
    },

    // Events Section
    {
      id: '5',
      name: 'Tech Summit 2025',
      lastMessage: 'Welcome to the Tech Summit 2025 group chat!',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isOnline: true,
      unreadCount: 5,
      section: 'events'
    },
    {
      id: '6',
      name: 'Hackathon Committee',
      lastMessage: 'New schedule updates available',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      isOnline: true,
      unreadCount: 3,
      section: 'events'
    },
    {
      id: '7',
      name: 'Workshop Planning',
      lastMessage: 'Materials list has been shared',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      isOnline: false,
      unreadCount: 0,
      section: 'events'
    },
    {
      id: '8',
      name: 'Dev Conference 2025',
      lastMessage: 'Registration deadline extended!',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isOnline: true,
      unreadCount: 2,
      section: 'events'
    }
  ];

  private messages: { [userId: string]: ChatMessage[] } = {
    '1': [
      {
        id: 'm1',
        senderId: '1',
        receiverId: 'current-user',
        content: 'Hello! How are you doing?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        isRead: true,
        type: 'text'
      },
      {
        id: 'm2',
        senderId: 'current-user',
        receiverId: '1',
        content: 'Hi Alice! I\'m doing well, thanks for asking.',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        isRead: true,
        type: 'text'
      },
      {
        id: 'm3',
        senderId: '1',
        receiverId: 'current-user',
        content: 'That\'s great to hear! Any plans for the weekend?',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        isRead: false,
        type: 'text'
      },
      {
        id: 'm4',
        senderId: '1',
        receiverId: 'current-user',
        content: 'Hey, how are you doing today?',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        isRead: false,
        type: 'text'
      }
    ],
    '5': [
      {
        id: 'm5',
        senderId: '5',
        receiverId: 'current-user',
        content: 'Hello everyone! Welcome to the Tech Summit 2025 group chat.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        isRead: false,
        type: 'text'
      },
      {
        id: 'm6',
        senderId: '5',
        receiverId: 'current-user',
        content: 'This will be our main communication channel for all event updates.',
        timestamp: new Date(Date.now() - 1000 * 60 * 50),
        isRead: false,
        type: 'text'
      },
      {
        id: 'm7',
        senderId: 'current-user',
        receiverId: '5',
        content: 'Thanks for setting this up! Looking forward to the event.',
        timestamp: new Date(Date.now() - 1000 * 60 * 40),
        isRead: true,
        type: 'text'
      },
      {
        id: 'm8',
        senderId: '5',
        receiverId: 'current-user',
        content: 'When are the speakers Schedule be shared?',
        timestamp: new Date(Date.now() - 1000 * 60 * 35),
        isRead: false,
        type: 'text'
      },
      {
        id: 'm9',
        senderId: '5',
        receiverId: 'current-user',
        content: 'Welcome to the Tech Summit 2025 group chat!',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        isRead: false,
        type: 'text'
      }
    ]
  };

  getUsersBySection(section: ChatSection): ChatUser[] {
    return this.users.filter(user => user.section === section);
  }

  getMessagesForUser(userId: string): ChatMessage[] {
    return this.messages[userId] || [];
  }

  sendMessage(message: ChatMessage): void {
    const userId = message.senderId === 'current-user' ? message.receiverId : message.senderId;
    
    if (!this.messages[userId]) {
      this.messages[userId] = [];
    }
    
    this.messages[userId].push(message);
    
    // Update user's last message
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.lastMessage = message.content;
      user.lastMessageTime = message.timestamp;
      if (message.senderId !== 'current-user') {
        user.unreadCount++;
      }
    }
  }

  markMessagesAsRead(userId: string): void {
    const userMessages = this.messages[userId];
    if (userMessages) {
      userMessages.forEach(message => {
        if (message.receiverId === 'current-user') {
          message.isRead = true;
        }
      });
    }
    
    // Reset unread count
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.unreadCount = 0;
    }
  }
}
