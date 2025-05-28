// routes/user/chat.routes.ts
import express from 'express';
import { container } from '../../configs/container/index';
import { ChatController } from '../../../src/controllers/implementation/user/chat/chat.controller';

const chatRoutes = express.Router();
const chatController = container.resolve(ChatController);

// Personal chat routes
chatRoutes.post('/personal', (req, res) => chatController.createPersonalChat(req, res));
chatRoutes.get('/personal/user/:otherUserId', (req, res) => chatController.getChatBetweenUsers(req, res));

// Event chat routes
chatRoutes.post('/event', (req, res) => chatController.createEventChat(req, res));
chatRoutes.get('/event/:eventId', (req, res) => chatController.getEventChat(req, res));
chatRoutes.post('/event/:eventId/join', (req, res) => chatController.joinEventChat(req, res));
chatRoutes.post('/event/:eventId/leave', (req, res) => chatController.leaveEventChat(req, res)); 
// chatRoutes.get('/event/:eventId/participants', (req, res) => chatController.getEventChatParticipants(req, res));

// General chat routes
chatRoutes.get('/', (req, res) => chatController.getUserChats(req, res));
chatRoutes.get('/:chatId', (req, res) => chatController.getChatById(req, res));
chatRoutes.get('/:chatId/messages', (req, res) => chatController.getChatMessages(req, res));
chatRoutes.patch('/:chatId/read', (req, res) => chatController.markMessagesAsRead(req, res)); 
chatRoutes.get('/unread/count', (req, res) => chatController.getUnreadMessageCount(req, res));
chatRoutes.delete('/:chatId', (req, res) => chatController.deleteChat(req, res));

export default chatRoutes;