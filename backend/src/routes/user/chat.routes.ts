import express from 'express';
import { container } from '../../configs/container';
import { ChatController } from '../../../src/controllers/implementation/user/chat/chat.controller';

const router = express.Router();
const chatController = container.resolve(ChatController);

router.post('/', (req, res) => chatController.createChat(req, res));
router.get('/', (req, res) => chatController.getUserChats(req, res));
router.get('/:chatId', (req, res) => chatController.getChatById(req, res));
router.get('/:chatId/messages', (req, res) => chatController.getChatMessages(req, res));
router.get('/user/:otherUserId', (req, res) => chatController.getChatBetweenUsers(req, res));
router.put('/:chatId/read', (req, res) => chatController.markMessagesAsRead(req, res));
router.get('/unread/count', (req, res) => chatController.getUnreadMessageCount(req, res));
router.delete('/:chatId', (req, res) => chatController.deleteChat(req, res));

export default router;