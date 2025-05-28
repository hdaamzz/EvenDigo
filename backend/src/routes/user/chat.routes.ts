import express from 'express';
import { container } from '../../configs/container/index';
import { ChatController } from '../../../src/controllers/implementation/user/chat/chat.controller';

const chatRoutes = express.Router();
const chatController = container.resolve(ChatController);

chatRoutes.post('/', (req, res) => chatController.createChat(req, res));
chatRoutes.get('/', (req, res) => chatController.getUserChats(req, res));
chatRoutes.get('/:chatId', (req, res) => chatController.getChatById(req, res));
chatRoutes.get('/:chatId/messages', (req, res) => chatController.getChatMessages(req, res));
chatRoutes.get('/user/:otherUserId', (req, res) => chatController.getChatBetweenUsers(req, res));
chatRoutes.put('/:chatId/read', (req, res) => chatController.markMessagesAsRead(req, res));
chatRoutes.get('/unread/count', (req, res) => chatController.getUnreadMessageCount(req, res));
chatRoutes.delete('/:chatId', (req, res) => chatController.deleteChat(req, res));

export default chatRoutes;