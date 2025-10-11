import { User } from "../../models/userModel";

export interface ChatItem {
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
  chatType: 'personal' | 'group';
  participants?: ChatUser[];
  eventId?: string;
  isActive?: boolean;
}

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
  senderName?:string
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
  senderName?:string;
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

export interface ChatItem {
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
  chatType: 'personal' | 'group';
  participants?: ChatUser[];
  eventId?: string;
  isActive?: boolean;
}