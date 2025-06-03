import { Request, Response } from 'express';
import { IChatService } from '../../../../services/interfaces/user/chat/IChat.service';
import { inject, injectable } from 'tsyringe';
import StatusCode from '../../../../types/statuscode';
import { ResponseHandler } from '../../../../../src/utils/response-handler';

@injectable()
export class PersonalMessageController {
  constructor(
    @inject('ChatService') private chatService: IChatService
  ) {}

  /**
   * Get messages from a personal chat
   */
  async getChatMessages(req: Request, res: Response): Promise<void> {
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
          'Access denied to this personal chat', 
          StatusCode.FORBIDDEN
        );
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
      
      if (limit > 100) {
        return ResponseHandler.error(
          res, 
          new Error('Limit exceeded'), 
          'Limit cannot exceed 100', 
          StatusCode.BAD_REQUEST
        );
      }
      
      const messages = await this.chatService.getChatMessages(chatId, limit, skip);
      ResponseHandler.success(res, {
        messages,
        pagination: {
          limit,
          skip,
          count: messages.length
        },
        message: 'Personal chat messages retrieved successfully'
      });
    } catch (error: any) {
      ResponseHandler.error(res, error, 'Personal chat not found', StatusCode.NOT_FOUND);
    }
  }

  /**
   * Get paginated messages from a personal chat
   */
  async getChatMessagesWithPagination(req: Request, res: Response): Promise<void> {
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
          'Access denied to this personal chat', 
          StatusCode.FORBIDDEN
        );
      }
      
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      if (page < 1) {
        return ResponseHandler.error(
          res, 
          new Error('Invalid page number'), 
          'Page must be greater than 0', 
          StatusCode.BAD_REQUEST
        );
      }

      if (limit > 100 || limit < 1) {
        return ResponseHandler.error(
          res, 
          new Error('Invalid limit'), 
          'Limit must be between 1 and 100', 
          StatusCode.BAD_REQUEST
        );
      }
      
      const result = await this.chatService.getChatMessagesWithPagination(chatId, page, limit);
      ResponseHandler.success(res, {
        messages: result.messages,
        pagination: {
          totalMessages: result.totalMessages,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
          limit
        },
        message: 'Personal chat messages retrieved successfully'
      });
    } catch (error: any) {
      ResponseHandler.error(res, error, 'Personal chat not found', StatusCode.NOT_FOUND);
    }
  }

  /**
   * Send a message to a personal chat
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const { content, messageType = 'text' } = req.body;
      const userId = req.user?.id;
      
      console.log("sendMessage to personal chat:", chatId, content, messageType, userId);
      
      if (!userId) {
        return ResponseHandler.error(
          res, 
          new Error('User not authenticated'), 
          'Unauthorized', 
          StatusCode.UNAUTHORIZED
        );
      }

      if (!content || !content.trim()) {
        return ResponseHandler.error(
          res, 
          new Error('Empty message content'), 
          'Message content is required', 
          StatusCode.BAD_REQUEST
        );
      }

      const hasAccess = await this.chatService.validateChatAccess(chatId, userId);
      if (!hasAccess) {
        return ResponseHandler.error(
          res, 
          new Error('Access denied'), 
          'Access denied to this personal chat', 
          StatusCode.FORBIDDEN
        );
      }
      
      const message = await this.chatService.addMessage(chatId, userId, content, messageType);
      ResponseHandler.success(res, message, 'Message sent to personal chat successfully', StatusCode.CREATED);
    } catch (error: any) {
      ResponseHandler.error(res, error, 'Failed to send message to personal chat', StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Update a message in personal chat
   */
  async updateMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return ResponseHandler.error(
          res, 
          new Error('User not authenticated'), 
          'Unauthorized', 
          StatusCode.UNAUTHORIZED
        );
      }

      if (!content || !content.trim()) {
        return ResponseHandler.error(
          res, 
          new Error('Empty message content'), 
          'Message content is required', 
          StatusCode.BAD_REQUEST
        );
      }
      
      const updatedMessage = await this.chatService.updateMessage(messageId, content, userId);
      ResponseHandler.success(res, updatedMessage, 'Personal chat message updated successfully');
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? StatusCode.NOT_FOUND : 
                        error.message.includes('only edit your own') ? StatusCode.FORBIDDEN : 
                        StatusCode.INTERNAL_SERVER_ERROR;
      ResponseHandler.error(res, error, 'Failed to update personal chat message', statusCode);
    }
  }

  /**
   * Delete a message from personal chat
   */
  async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return ResponseHandler.error(
          res, 
          new Error('User not authenticated'), 
          'Unauthorized', 
          StatusCode.UNAUTHORIZED
        );
      }
      
      await this.chatService.deleteMessage(messageId, userId);
      ResponseHandler.success(res, null, 'Personal chat message deleted successfully');
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? StatusCode.NOT_FOUND : 
                        error.message.includes('only delete your own') ? StatusCode.FORBIDDEN : 
                        StatusCode.INTERNAL_SERVER_ERROR;
      ResponseHandler.error(res, error, 'Failed to delete personal chat message', statusCode);
    }
  }

  /**
   * Get a specific message by ID (with access validation)
   */
  async getMessageById(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return ResponseHandler.error(
          res, 
          new Error('User not authenticated'), 
          'Unauthorized', 
          StatusCode.UNAUTHORIZED
        );
      }

      const message = await this.chatService.getMessageById(messageId);
      
      if (!message) {
        return ResponseHandler.error(
          res, 
          new Error('Message not found'), 
          'Personal chat message not found', 
          StatusCode.NOT_FOUND
        );
      }

      const hasAccess = await this.chatService.validateChatAccess(message.chatId.toString(), userId);
      if (!hasAccess) {
        return ResponseHandler.error(
          res, 
          new Error('Access denied'), 
          'Access denied to this personal chat message', 
          StatusCode.FORBIDDEN
        );
      }
      
      ResponseHandler.success(res, message, 'Personal chat message retrieved successfully');
    } catch (error: any) {
      ResponseHandler.error(res, error, 'Failed to get personal chat message', StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Mark messages as read in a personal chat
   */
  async markMessagesAsRead(req: Request, res: Response): Promise<void> {
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
          'Access denied to this personal chat', 
          StatusCode.FORBIDDEN
        );
      }
      
      await this.chatService.markMessagesAsRead(chatId, userId);
      ResponseHandler.success(res, null, 'Personal chat messages marked as read');
    } catch (error: any) {
      ResponseHandler.error(res, error, 'Failed to mark personal chat messages as read', StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get unread message count for user across all personal chats
   */
  async getUnreadMessageCount(req: Request, res: Response): Promise<void> {
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
      
      const count = await this.chatService.getUnreadMessageCount(userId);
      ResponseHandler.success(res, { 
        unreadCount: count,
        message: 'Unread personal chat messages count retrieved successfully'
      });
    } catch (error: any) {
      ResponseHandler.error(res, error, 'Failed to get unread personal chat message count', StatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}