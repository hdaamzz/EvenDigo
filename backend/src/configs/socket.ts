import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { ChatService } from '../../src/services/implementation/user/chat/chat.service';
import { container } from 'tsyringe';


export default function configureSocketIO(server: HttpServer): SocketIOServer {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_SERVER,
      methods: ['GET', 'POST','PUT','DELETE'],
      credentials: true
    }
  });

  const chatService = container.resolve<ChatService>('ChatService');
  
  const onlineUsers = new Map<string, string>();

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('authenticate', (userId: string) => {
      onlineUsers.set(userId, socket.id);
      socket.join(userId);
      console.log(`User ${userId} authenticated with socket ${socket.id}`);
      
      io.emit('userStatus', { userId, status: 'online' });
    });

    socket.on('joinChat', (chatId: string) => {
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined chat ${chatId}`);
    });

    socket.on('sendMessage', async (data: { chatId: string, senderId: string, receiverId: string, content: string }) => {
      try {
        const { chatId, senderId, receiverId, content } = data;
        
        const message = await chatService.addMessage(chatId, senderId, content);
        
        io.to(chatId).emit('newMessage', message);
        
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('messageNotification', {
            chatId,
            senderId,
            message: content
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('markAsRead', async (data: { chatId: string, userId: string }) => {
      try {
        const { chatId, userId } = data;
        await chatService.markMessagesAsRead(chatId, userId);
        io.to(chatId).emit('messagesRead', { chatId, userId });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    socket.on('typing', (data: { chatId: string, userId: string }) => {
      const { chatId, userId } = data;
      socket.to(chatId).emit('userTyping', { userId });
    });

    socket.on('stopTyping', (data: { chatId: string, userId: string }) => {
      const { chatId, userId } = data;
      socket.to(chatId).emit('userStoppedTyping', { userId });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      let disconnectedUserId: string | null = null;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          break;
        }
      }
      
      if (disconnectedUserId) {
        onlineUsers.delete(disconnectedUserId);
        io.emit('userStatus', { userId: disconnectedUserId, status: 'offline' });
      }
    });
  });

  return io;
}