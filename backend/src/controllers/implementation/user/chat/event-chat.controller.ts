// import { Request, Response } from 'express';
// import { IChatService } from '../../../../services/interfaces/user/chat/IChat.service';
// import { inject, injectable } from 'tsyringe';
// import StatusCode from '../../../../types/statuscode';
// import { ResponseHandler } from '../../../../../src/utils/response-handler';

// @injectable()
// export class EventChatController {
//   constructor(
//     @inject('ChatService') private chatService: IChatService
//   ) {}

//   async createEventChat(req: Request, res: Response): Promise<void> {
//     try {
//       const { eventId, participants = [] } = req.body;
      
//       if (!eventId) {
//         return ResponseHandler.error(
//           res, 
//           new Error('Missing eventId'), 
//           'Event ID is required', 
//           StatusCode.BAD_REQUEST
//         );
//       }
      
//       const chat = await this.chatService.createEventChat(eventId, participants);
//       ResponseHandler.success(res, chat, 'Event chat created successfully', StatusCode.CREATED);
//     } catch (error: any) {
//       ResponseHandler.error(res, error, 'Failed to create event chat', StatusCode.INTERNAL_SERVER_ERROR);
//     }
//   }

//   async getEventChat(req: Request, res: Response): Promise<void> {
//     try {
//       const { eventId } = req.params;
      
//       const chat = await this.chatService.getEventChat(eventId);
      
//       if (!chat) {
//         return ResponseHandler.error(
//           res, 
//           new Error('Event chat not found'), 
//           'No chat found for this event', 
//           StatusCode.NOT_FOUND
//         );
//       }
      
//       ResponseHandler.success(res, chat);
//     } catch (error: any) {
//       ResponseHandler.error(res, error, 'Failed to get event chat', StatusCode.INTERNAL_SERVER_ERROR);
//     }
//   }

//   async joinEventChat(req: Request, res: Response): Promise<void> {
//     try {
//       const { eventId } = req.params;
//       const userId = req.user?.id;
      
//       if (!userId) {
//         return ResponseHandler.error(
//           res, 
//           new Error('User not authenticated'), 
//           'Unauthorized', 
//           StatusCode.UNAUTHORIZED
//         );
//       }
      
//       const chat = await this.chatService.joinEventChat(eventId, userId);
//       ResponseHandler.success(res, chat, 'Successfully joined event chat');
//     } catch (error: any) {
//       ResponseHandler.error(res, error, 'Failed to join event chat', StatusCode.INTERNAL_SERVER_ERROR);
//     }
//   }

//   async leaveEventChat(req: Request, res: Response): Promise<void> {
//     try {
//       const { eventId } = req.params;
//       const userId = req.user?.id;
      
//       if (!userId) {
//         return ResponseHandler.error(
//           res, 
//           new Error('User not authenticated'), 
//           'Unauthorized', 
//           StatusCode.UNAUTHORIZED
//         );
//       }
      
//       await this.chatService.leaveEventChat(eventId, userId);
//       ResponseHandler.success(res, null, 'Successfully left event chat');
//     } catch (error: any) {
//       ResponseHandler.error(res, error, 'Failed to leave event chat', StatusCode.INTERNAL_SERVER_ERROR);
//     }
//   }
// }