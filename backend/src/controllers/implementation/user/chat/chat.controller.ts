import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import StatusCode from '../../../../../src/types/statuscode';
import { IChatService } from '../../../../../src/services/interfaces/user/chat/IChatService';
import { IGroupChatService } from '../../../../../src/services/interfaces/user/chat/IGroupChatService';
import { IChatController } from '../../../../../src/controllers/interfaces/User/Chat/IChat.controller';

@injectable()
export class ChatController implements IChatController{

  constructor(
    @inject("ChatService") private chatService: IChatService,
    @inject("GroupChatService") private groupChatService: IGroupChatService,
  ) {}

  getChats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user._id;
       const chats = await this.chatService.getUserChats(userId);
      
      res.status(StatusCode.OK).json({ success: true, data: chats });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        error: 'Failed to create event' 
      });
    }
  };
  getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const messages = await this.chatService.getChatMessages(req.params.chatId);

      res.status(StatusCode.OK).json({ success: true, data: messages });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        error: 'Failed to create event' 
      });
    }
  };
  getUsersGroupChat = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user._id;
      const groupChats = await this.groupChatService.getUserGroupChats(userId);
      res.status(StatusCode.OK).json({ success: true, data: groupChats });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        error: 'Failed to create event' 
      });
    }
  };

    getMessageGroupChat = async (req: Request, res: Response): Promise<void> => {
    try {
      const messages = await this.groupChatService.getGroupChatMessages(req.params.groupChatId);
      res.status(StatusCode.OK).json({ success: true, data: messages });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        error: 'Failed to create event' 
      });
    }
  };
}
