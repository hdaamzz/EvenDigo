// src/controllers/implementation/user/chat/chat.controller.ts
import { Request, Response } from 'express';
import { IChatService } from '../../../../services/interfaces/user/chat/IChat.service';
import { inject, injectable } from 'tsyringe';

@injectable()
export class ChatController {
  constructor(
    @inject('ChatService') private chatService: IChatService
  ) {}

  async createPersonalChat(req: Request, res: Response): Promise<void> {
    try {
      const { participants } = req.body;
      
      if (!participants || !Array.isArray(participants) || participants.length !== 2) {
        res.status(400).json({ message: 'Exactly two participants are required for personal chat' });
        return;
      }
      
      const chat = await this.chatService.createPersonalChat(participants);
      res.status(201).json({
        success: true,
        data: chat,
        message: 'Personal chat created successfully'
      });
    } catch (error: any) {
      console.error('Error creating personal chat:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || 'Failed to create personal chat' 
      });
    }
  }

  async createEventChat(req: Request, res: Response): Promise<void> {
    try {
      const { eventId, participants = [] } = req.body;
      
      if (!eventId) {
        res.status(400).json({ message: 'Event ID is required' });
        return;
      }
      
      const chat = await this.chatService.createEventChat(eventId, participants);
      res.status(201).json({
        success: true,
        data: chat,
        message: 'Event chat created successfully'
      });
    } catch (error: any) {
      console.error('Error creating event chat:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || 'Failed to create event chat' 
      });
    }
  }

  async getChatById(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const chat = await this.chatService.getChatById(chatId);
      res.status(200).json({
        success: true,
        data: chat
      });
    } catch (error: any) {
      console.error('Error getting chat:', error);
      res.status(404).json({ 
        success: false,
        message: error.message || 'Chat not found' 
      });
    }
  }

  async getUserChats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const chats = await this.chatService.getUserChats(userId);
      res.status(200).json({
        success: true,
        data: chats
      });
    } catch (error: any) {
      console.error('Error getting user chats:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || 'Failed to get user chats' 
      });
    }
  }

  async getChatMessages(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
      
      const messages = await this.chatService.getChatMessages(chatId, limit, skip);
      res.status(200).json({
        success: true,
        data: messages
      });
    } catch (error: any) {
      console.error('Error getting chat messages:', error);
      res.status(404).json({ 
        success: false,
        message: error.message || 'Chat not found' 
      });
    }
  }

  async getChatBetweenUsers(req: Request, res: Response): Promise<void> {
    try {
      const { otherUserId } = req.params;
      const currentUserId = req.user?.id;
      
      if (!currentUserId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const chat = await this.chatService.getChatBetweenUsers(currentUserId, otherUserId);
      
      if (!chat) {
        res.status(404).json({ 
          success: false,
          message: 'No chat found between these users' 
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: chat
      });
    } catch (error: any) {
      console.error('Error finding chat between users:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || 'Failed to find chat' 
      });
    }
  }

  async getEventChat(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      
      const chat = await this.chatService.getEventChat(eventId);
      
      if (!chat) {
        res.status(404).json({ 
          success: false,
          message: 'No chat found for this event' 
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: chat
      });
    } catch (error: any) {
      console.error('Error getting event chat:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || 'Failed to get event chat' 
      });
    }
  }

  async joinEventChat(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const chat = await this.chatService.joinEventChat(eventId, userId);
      res.status(200).json({
        success: true,
        data: chat,
        message: 'Successfully joined event chat'
      });
    } catch (error: any) {
      console.error('Error joining event chat:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || 'Failed to join event chat' 
      });
    }
  }

  async leaveEventChat(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      await this.chatService.leaveEventChat(eventId, userId);
      res.status(200).json({
        success: true,
        message: 'Successfully left event chat'
      });
    } catch (error: any) {
      console.error('Error leaving event chat:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || 'Failed to leave event chat' 
      });
    }
  }

  async markMessagesAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      await this.chatService.markMessagesAsRead(chatId, userId);
      res.status(200).json({ 
        success: true,
        message: 'Messages marked as read' 
      });
    } catch (error: any) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || 'Failed to mark messages as read' 
      });
    }
  }

  async getUnreadMessageCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const count = await this.chatService.getUnreadMessageCount(userId);
      res.status(200).json({ 
        success: true,
        data: { count } 
      });
    } catch (error: any) {
      console.error('Error getting unread message count:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || 'Failed to get unread message count' 
      });
    }
  }

  async deleteChat(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      await this.chatService.deleteChat(chatId);
      res.status(200).json({ 
        success: true,
        message: 'Chat deleted successfully' 
      });
    } catch (error: any) {
      console.error('Error deleting chat:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || 'Failed to delete chat' 
      });
    }
  }
}