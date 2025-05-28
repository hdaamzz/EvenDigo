import { Request, Response } from 'express';
import { IChatService } from '../../../../../src/services/interfaces/user/chat/IChat.service';
import { inject, injectable } from 'tsyringe';


@injectable()
export class ChatController {
  constructor(
    @inject('ChatService') private chatService: IChatService
  ) {}


  async createChat(req: Request, res: Response): Promise<void> {
    try {
      const { participants } = req.body;
      
      if (!participants || !Array.isArray(participants) || participants.length < 2) {
        res.status(400).json({ message: 'At least two participants are required' });
        return;
      }
      
      const chat = await this.chatService.createChat(participants);
      res.status(201).json(chat);
    } catch (error: any) {
      console.error('Error creating chat:', error);
      res.status(500).json({ message: error.message || 'Failed to create chat' });
    }
  }


  async getChatById(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const chat = await this.chatService.getChatById(chatId);
      res.status(200).json(chat);
    } catch (error: any) {
      console.error('Error getting chat:', error);
      res.status(404).json({ message: error.message || 'Chat not found' });
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
      res.status(200).json(chats);
    } catch (error: any) {
      console.error('Error getting user chats:', error);
      res.status(500).json({ message: error.message || 'Failed to get user chats' });
    }
  }


  async getChatMessages(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
      
      const messages = await this.chatService.getChatMessages(chatId, limit, skip);
      res.status(200).json(messages);
    } catch (error: any) {
      console.error('Error getting chat messages:', error);
      res.status(404).json({ message: error.message || 'Chat not found' });
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
        res.status(404).json({ message: 'No chat found between these users' });
        return;
      }
      
      res.status(200).json(chat);
    } catch (error: any) {
      console.error('Error finding chat between users:', error);
      res.status(500).json({ message: error.message || 'Failed to find chat' });
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
      res.status(200).json({ message: 'Messages marked as read' });
    } catch (error: any) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({ message: error.message || 'Failed to mark messages as read' });
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
      res.status(200).json({ count });
    } catch (error: any) {
      console.error('Error getting unread message count:', error);
      res.status(500).json({ message: error.message || 'Failed to get unread message count' });
    }
  }


  async deleteChat(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      await this.chatService.deleteChat(chatId);
      res.status(200).json({ message: 'Chat deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting chat:', error);
      res.status(500).json({ message: error.message || 'Failed to delete chat' });
    }
  }
}