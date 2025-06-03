import { Request, Response } from 'express';
import { IChatService } from '../../../../services/interfaces/user/chat/IChat.service';
import { inject, injectable } from 'tsyringe';
import StatusCode from '../../../../types/statuscode';
import { ResponseHandler } from '../../../../../src/utils/response-handler';

@injectable()
export class PersonalChatController {
  constructor(
    @inject('ChatService') private chatService: IChatService
  ) {}

  /**
   * Create or get existing personal chat between two users
   */
  async createOrGetPersonalChat(req: Request, res: Response): Promise<void> {
    try {
      const { otherUserId } = req.body;
      console.log(otherUserId);
      
      const currentUserId = req.user?.id;
      
      if (!currentUserId) {
        return ResponseHandler.error(
          res, 
          new Error('User not authenticated'), 
          'Unauthorized', 
          StatusCode.UNAUTHORIZED
        );
      }

      if (!otherUserId) {
        return ResponseHandler.error(
          res, 
          new Error('Missing otherUserId'), 
          'Other user ID is required', 
          StatusCode.BAD_REQUEST
        );
      }

      if (currentUserId === otherUserId) {
        return ResponseHandler.error(
          res, 
          new Error('Invalid user combination'), 
          'Cannot create chat with yourself', 
          StatusCode.BAD_REQUEST
        );
      }

      // First check if chat already exists
      let chat = await this.chatService.getChatBetweenUsers(currentUserId, otherUserId);
      
      // If no existing chat, create new one
      if (!chat) {
        chat = await this.chatService.createPersonalChat([currentUserId, otherUserId]);
      }
      
      ResponseHandler.success(res, chat, 'Personal chat ready', StatusCode.OK);
    } catch (error: any) {
      ResponseHandler.error(res, error, 'Failed to create or get personal chat', StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get personal chat by chat ID
   */
  async getChatById(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return ResponseHandler.error(
          res, 
          new Error('User not authenticated'), 
          'Unauthorized', 
          StatusCode.UNAUTHORIZED
        );
      }

      const hasAccess = await this.chatService.validateChatAccess(chatId, userId);
      if (!hasAccess) {
        return ResponseHandler.error(
          res, 
          new Error('Access denied'), 
          'Access denied to this chat', 
          StatusCode.FORBIDDEN
        );
      }

      const chat = await this.chatService.getChatById(chatId);
      ResponseHandler.success(res, chat);
    } catch (error: any) {
      ResponseHandler.error(res, error, 'Chat not found', StatusCode.NOT_FOUND);
    }
  }

  /**
   * Get all personal chats for current user
   */
  async getUserChats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return ResponseHandler.error(
          res, 
          new Error('User not authenticated'), 
          'Unauthorized', 
          StatusCode.UNAUTHORIZED
        );
      }
      
      const chats = await this.chatService.getUserChats(userId);
      ResponseHandler.success(res, { 
        chats, 
        count: chats.length,
        message: 'Personal chats retrieved successfully'
      });
    } catch (error: any) {
      ResponseHandler.error(res, error, 'Failed to get user chats', StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get personal chat between current user and another user
   */
  async getChatBetweenUsers(req: Request, res: Response): Promise<void> {
    try {
      const { otherUserId } = req.params;
      const currentUserId = req.user?.id;
      
      if (!currentUserId) {
        return ResponseHandler.error(
          res, 
          new Error('User not authenticated'), 
          'Unauthorized', 
          StatusCode.UNAUTHORIZED
        );
      }

      if (currentUserId === otherUserId) {
        return ResponseHandler.error(
          res, 
          new Error('Invalid user combination'), 
          'Cannot get chat with yourself', 
          StatusCode.BAD_REQUEST
        );
      }
      
      const chat = await this.chatService.getChatBetweenUsers(currentUserId, otherUserId);
      
      if (!chat) {
        return ResponseHandler.error(
          res, 
          new Error('Chat not found'), 
          'No personal chat found between these users', 
          StatusCode.NOT_FOUND
        );
      }
      
      ResponseHandler.success(res, chat);
    } catch (error: any) {
      ResponseHandler.error(res, error, 'Failed to find personal chat', StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Delete/deactivate personal chat
   */
  async deleteChat(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return ResponseHandler.error(
          res, 
          new Error('User not authenticated'), 
          'Unauthorized', 
          StatusCode.UNAUTHORIZED
        );
      }

      const hasAccess = await this.chatService.validateChatAccess(chatId, userId);
      if (!hasAccess) {
        return ResponseHandler.error(
          res, 
          new Error('Access denied'), 
          'Access denied to this chat', 
          StatusCode.FORBIDDEN
        );
      }

      await this.chatService.deleteChat(chatId);
      ResponseHandler.success(res, null, 'Personal chat deleted successfully');
    } catch (error: any) {
      ResponseHandler.error(res, error, 'Failed to delete personal chat', StatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}