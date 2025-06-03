import { Request, Response } from 'express';
import { IChatService } from '../../../../services/interfaces/user/chat/IChat.service';
import { inject } from 'tsyringe';
import StatusCode from '../../../../types/statuscode';
import { ResponseHandler } from '../../../../../src/utils/response-handler';

export abstract class BasePersonalChatController {
  constructor(
    @inject('ChatService') protected chatService: IChatService
  ) {}

  /**
   * Validate and extract user ID from request
   */
  protected async validateUser(req: Request, res: Response): Promise<string | null> {
    const userId = req.user?.id;
    
    if (!userId) {
      ResponseHandler.error(
        res, 
        new Error('User not authenticated'), 
        'Authentication required for personal chat access', 
        StatusCode.UNAUTHORIZED
      );
      return null;
    }
    
    return userId;
  }

  /**
   * Validate user's access to a personal chat
   */
  protected async validatePersonalChatAccess(chatId: string, userId: string, res: Response): Promise<boolean> {
    try {
      if (!chatId || !userId) {
        ResponseHandler.error(
          res, 
          new Error('Invalid parameters'), 
          'Chat ID and User ID are required', 
          StatusCode.BAD_REQUEST
        );
        return false;
      }

      const hasAccess = await this.chatService.validateChatAccess(chatId, userId);
      if (!hasAccess) {
        ResponseHandler.error(
          res, 
          new Error('Access denied'), 
          'Access denied to this personal chat', 
          StatusCode.FORBIDDEN
        );
        return false;
      }
      return true;
    } catch (error) {
      ResponseHandler.error(res, error as Error, 'Failed to validate personal chat access', StatusCode.INTERNAL_SERVER_ERROR);
      return false;
    }
  }

  /**
   * Validate pagination parameters for message retrieval
   */
  protected validatePaginationParams(page: number, limit: number, res: Response): boolean {
    if (page < 1) {
      ResponseHandler.error(
        res, 
        new Error('Invalid page number'), 
        'Page must be greater than 0', 
        StatusCode.BAD_REQUEST
      );
      return false;
    }

    if (limit > 100 || limit < 1) {
      ResponseHandler.error(
        res, 
        new Error('Invalid limit'), 
        'Limit must be between 1 and 100', 
        StatusCode.BAD_REQUEST
      );
      return false;
    }

    return true;
  }

  /**
   * Validate message content before sending
   */
  protected validateMessageContent(content: string, res: Response): boolean {
    if (!content || !content.trim()) {
      ResponseHandler.error(
        res, 
        new Error('Empty message content'), 
        'Message content is required for personal chat', 
        StatusCode.BAD_REQUEST
      );
      return false;
    }
    return true;
  }

  /**
   * Validate that two users are different (can't chat with themselves)
   */
  protected validateDifferentUsers(currentUserId: string, otherUserId: string, res: Response): boolean {
    if (currentUserId === otherUserId) {
      ResponseHandler.error(
        res, 
        new Error('Invalid user combination'), 
        'Cannot create personal chat with yourself', 
        StatusCode.BAD_REQUEST
      );
      return false;
    }
    return true;
  }

  /**
   * Validate other user ID parameter
   */
  protected validateOtherUserId(otherUserId: string, res: Response): boolean {
    if (!otherUserId) {
      ResponseHandler.error(
        res, 
        new Error('Missing otherUserId'), 
        'Other user ID is required for personal chat', 
        StatusCode.BAD_REQUEST
      );
      return false;
    }
    return true;
  }

  /**
   * Handle common personal chat errors with appropriate status codes
   */
  protected handlePersonalChatError(error: any, res: Response, defaultMessage: string): void {
    let statusCode = StatusCode.INTERNAL_SERVER_ERROR;
    let message = defaultMessage;

    if (error.message.includes('not found')) {
      statusCode = StatusCode.NOT_FOUND;
      message = 'Personal chat or message not found';
    } else if (error.message.includes('access') || error.message.includes('authorized')) {
      statusCode = StatusCode.FORBIDDEN;
      message = 'Access denied to personal chat';
    } else if (error.message.includes('participants') || error.message.includes('exactly 2')) {
      statusCode = StatusCode.BAD_REQUEST;
      message = 'Personal chat requires exactly 2 participants';
    } else if (error.message.includes('only edit your own') || error.message.includes('only delete your own')) {
      statusCode = StatusCode.FORBIDDEN;
      message = 'You can only modify your own messages';
    }

    ResponseHandler.error(res, error, message, statusCode);
  }
}