import { Request, Response } from 'express';
import { IChatService } from '../../../../services/interfaces/user/chat/IChat.service';
import { inject, injectable } from 'tsyringe';
import StatusCode from '../../../../types/statuscode';
import { ResponseHandler } from '../../../../utils/response-handler';

@injectable()
export class PersonalChatController {
  constructor(
    @inject('ChatService') private chatService: IChatService
  ) {}

  async createOrGetPersonalChat(req: Request, res: Response): Promise<void> {
    try {
      const { otherUserId } = req.body;
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

      let chat = await this.chatService.getChatBetweenUsers(currentUserId, otherUserId);
      
      if (!chat) {
        chat = await this.chatService.createPersonalChat([currentUserId, otherUserId]);
      }
      
      ResponseHandler.success(res, chat, 'Personal chat ready', StatusCode.OK);
    } catch (error) {
      ResponseHandler.error(res, error, 'Failed to create or get personal chat', StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async createGroupChat(req: Request, res: Response): Promise<void> {
    try {
      const { eventId, name, participantIds } = req.body;
      const currentUserId = req.user?.id;
      
      if (!currentUserId) {
        return ResponseHandler.error(
          res, 
          new Error('User not authenticated'), 
          'Unauthorized', 
          StatusCode.UNAUTHORIZED
        );
      }

      if (!eventId || !name) {
        return ResponseHandler.error(
          res, 
          new Error('Missing required fields'), 
          'Event ID and name are required', 
          StatusCode.BAD_REQUEST
        );
      }

      const participantIdsWithCurrent = participantIds?.length ? [...participantIds, currentUserId] : [currentUserId];
      
      let chat = await this.chatService.getGroupChatByEventId(eventId);
      
      if (!chat) {
        chat = await this.chatService.createGroupChat(eventId, name, participantIdsWithCurrent);
      }
      
      ResponseHandler.success(res, chat, 'Group chat ready', StatusCode.OK);
    } catch (error) {
      ResponseHandler.error(res, error, 'Failed to create or get group chat', StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async addParticipantToGroupChat(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const { userId } = req.body;
      const currentUserId = req.user?.id;
      
      if (!currentUserId) {
        return ResponseHandler.error(
          res, 
          new Error('User not authenticated'), 
          'Unauthorized', 
          StatusCode.UNAUTHORIZED
        );
      }

      if (!userId) {
        return ResponseHandler.error(
          res, 
          new Error('Missing userId'), 
          'User ID is required', 
          StatusCode.BAD_REQUEST
        );
      }

      const hasAccess = await this.chatService.validateChatAccess(chatId, currentUserId);
      if (!hasAccess) {
        return ResponseHandler.error(
          res, 
          new Error('Access denied'), 
          'Access denied to this group chat', 
          StatusCode.FORBIDDEN
        );
      }

      const chat = await this.chatService.addParticipantToGroupChat(chatId, userId);
      ResponseHandler.success(res, chat, 'Participant added to group chat', StatusCode.OK);
    } catch (error) {
      ResponseHandler.error(res, error, 'Failed to add participant to group chat', StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async getGroupChatByEventId(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const currentUserId = req.user?.id;
      
      if (!currentUserId) {
        return ResponseHandler.error(
          res, 
          new Error('User not authenticated'), 
          'Unauthorized', 
          StatusCode.UNAUTHORIZED
        );
      }

      const chat = await this.chatService.getGroupChatByEventId(eventId);
      
      if (!chat) {
        return ResponseHandler.error(
          res, 
          new Error('Chat not found'), 
          'No group chat found for this event', 
          StatusCode.NOT_FOUND
        );
      }

      const hasAccess = await this.chatService.validateChatAccess(chat._id.toString(), currentUserId);
      if (!hasAccess) {
        return ResponseHandler.error(
          res, 
          new Error('Access denied'), 
          'Access denied to this group chat', 
          StatusCode.FORBIDDEN
        );
      }
      
      ResponseHandler.success(res, chat, 'Group chat retrieved successfully');
    } catch (error) {
      ResponseHandler.error(res, error, 'Failed to find group chat', StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

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
    } catch (error) {
      ResponseHandler.error(res, error, 'Chat not found', StatusCode.NOT_FOUND);
    }
  }

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
        message: 'Chats retrieved successfully'
      });
    } catch (error) {
      ResponseHandler.error(res, error, 'Failed to get user chats', StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

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
    } catch (error) {
      ResponseHandler.error(res, error, 'Failed to find personal chat', StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

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
      ResponseHandler.success(res, null, 'Chat deleted successfully');
    } catch (error) {
      ResponseHandler.error(res, error, 'Failed to delete chat', StatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}