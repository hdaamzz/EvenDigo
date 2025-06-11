import express from 'express';
import { container } from '../../configs/container/index';
import { PersonalMessageController } from '../../../src/controllers/implementation/user/chat/message.controller';
import { PersonalChatController } from '../../../src/controllers/implementation/user/chat/chat-management.controller';


const chatRoutes = express.Router();

const chatManagementController = container.resolve(PersonalChatController);
const messageController = container.resolve(PersonalMessageController);

// ===== PERSONAL CHAT ROUTES =====
chatRoutes.post('/personal', (req, res) => chatManagementController.createOrGetPersonalChat(req, res));
chatRoutes.get('/personal/user/:otherUserId', (req, res) => chatManagementController.getChatBetweenUsers(req, res));

// ===== GENERAL CHAT MANAGEMENT ROUTES =====
chatRoutes.get('/', (req, res) => chatManagementController.getUserChats(req, res));
chatRoutes.get('/:chatId', (req, res) => chatManagementController.getChatById(req, res));
chatRoutes.delete('/:chatId', (req, res) => chatManagementController.deleteChat(req, res));

// ===== MESSAGE ROUTES =====
// Get messages
chatRoutes.get('/:chatId/messages', (req, res) => messageController.getChatMessages(req, res));
chatRoutes.get('/:chatId/messages/paginated', (req, res) => messageController.getChatMessagesWithPagination(req, res));

// Send message
chatRoutes.post('/:chatId/messages', (req, res) => messageController.sendMessage(req, res));

// Mark messages as read
chatRoutes.patch('/:chatId/read', (req, res) => messageController.markMessagesAsRead(req, res));

// Get unread count
chatRoutes.get('/unread/count', (req, res) => messageController.getUnreadMessageCount(req, res));

// ===== INDIVIDUAL MESSAGE OPERATIONS =====
chatRoutes.get('/messages/:messageId', (req, res) => messageController.getMessageById(req, res));
chatRoutes.put('/messages/:messageId', (req, res) => messageController.updateMessage(req, res));
chatRoutes.delete('/messages/:messageId', (req, res) => messageController.deleteMessage(req, res));

export default chatRoutes;