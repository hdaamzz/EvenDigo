import { Router } from 'express';
import { container } from 'tsyringe';
import { ChatController } from '../../../src/controllers/implementation/user/chat/chat.controller';

const chatController = container.resolve(ChatController);
const chatRoutes = Router()

chatRoutes.get('/',  (req, res) => chatController.getChats(req, res));
chatRoutes.post('/:chatId/messages',  (req, res) => chatController.getMessages(req, res));
chatRoutes.post('/group-chats',  (req, res) => chatController.getUsersGroupChat(req, res));
chatRoutes.get('/group-chats/:groupChatId/messages',(req,res)=>chatController.getMessageGroupChat(req,res));



export default chatRoutes;