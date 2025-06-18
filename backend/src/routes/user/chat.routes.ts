import express from 'express';
import { container } from '../../configs/container/index';
import { PersonalMessageController } from '../../../src/controllers/implementation/user/chat/message.controller';
import { PersonalChatController } from '../../../src/controllers/implementation/user/chat/chat-management.controller';

const chatRoutes = express.Router();

const chatManagementController = container.resolve(PersonalChatController);
const messageController = container.resolve(PersonalMessageController);

// Group Chat Routes
chatRoutes.post('/group', (req, res) => chatManagementController.createGroupChat(req, res));
chatRoutes.post('/group/:chatId/participants', (req, res) => chatManagementController.addParticipantToGroupChat(req, res));
chatRoutes.get('/group/event/:eventId', (req, res) => chatManagementController.getGroupChatByEventId(req, res));

// Personal Chat Routes
chatRoutes.post('/personal', (req, res) => chatManagementController.createOrGetPersonalChat(req, res));
chatRoutes.get('/personal/user/:otherUserId', (req, res) => chatManagementController.getChatBetweenUsers(req, res));

// General Chat Management Routes
chatRoutes.get('/', (req, res) => chatManagementController.getUserChats(req, res));
chatRoutes.get('/:chatId', (req, res) => chatManagementController.getChatById(req, res));
chatRoutes.delete('/:chatId', (req, res) => chatManagementController.deleteChat(req, res));

// Message Routes
chatRoutes.get('/:chatId/messages', (req, res) => messageController.getChatMessages(req, res));
chatRoutes.get('/:chatId/messages/paginated', (req, res) => messageController.getChatMessagesWithPagination(req, res));
chatRoutes.post('/:chatId/messages', (req, res) => messageController.sendMessage(req, res));
chatRoutes.patch('/:chatId/read', (req, res) => messageController.markMessagesAsRead(req, res));
chatRoutes.get('/unread/count', (req, res) => messageController.getUnreadMessageCount(req, res));
chatRoutes.get('/messages/:messageId', (req, res) => messageController.getMessageById(req, res));
chatRoutes.put('/messages/:messageId', (req, res) => messageController.updateMessage(req, res));
chatRoutes.delete('/messages/:messageId', (req, res) => messageController.deleteMessage(req, res));

export default chatRoutes;