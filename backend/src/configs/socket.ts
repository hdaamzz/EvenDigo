import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { ChatService } from '../services/implementation/user/chat/chat.service';
import { container } from 'tsyringe';
import jwt from 'jsonwebtoken';
import { TokenService } from '../services/implementation/user/auth/TokenService';
import { UserJWTPayload } from '../controllers/interfaces/User/Socket/socket.interface';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export default function configureSocketIO(server: HttpServer): SocketIOServer {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:4200",
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true
    },
    allowEIO3: true,
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    path: '/socket.io/'
  });

  const chatService = container.resolve<ChatService>('ChatService');
  const onlineUsers = new Map<string, string>();
  const tokenService = container.resolve<TokenService>('TokenService');

  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      console.log('Authentication attempt for socket:', socket.id);
      
      let token = socket.handshake.auth.token || 
                  socket.handshake.headers.authorization?.replace('Bearer ', '') ||
                  socket.request.headers.cookie?.split('accessToken=')[1]?.split(';')[0];
      
      console.log('Token received:', token ? 'Yes' : 'No');
      
      if (!token) {
        console.log('No authentication token provided');
        return next(new Error('Authentication token required'));
      }
      
      const decoded = tokenService.verifyToken(token) as UserJWTPayload;
      socket.userId = decoded.userId;

      console.log('Authentication successful for user:', socket.userId);
      next();
    } catch (error) {
      console.error('Authentication failed:', error.message);
      if (error instanceof jwt.TokenExpiredError) {
        console.error('- Token expired at:', error.expiredAt);
      }
      next(new Error(`Authentication failed: ${error.message}`));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.id}, UserId: ${socket.userId}`);
    console.log(`Total connected clients: ${io.engine.clientsCount}`);

    if (socket.userId) {
      onlineUsers.set(socket.userId, socket.id);
      socket.join(socket.userId);
      
      socket.broadcast.emit('userStatus', { 
        userId: socket.userId, 
        status: 'online' 
      });
      
      socket.emit('authenticated', { 
        userId: socket.userId,
        message: 'Successfully connected to chat server'
      });
      
      console.log(`User ${socket.userId} joined personal room`);
    }

    socket.on('joinChat', async (data: { chatId: string }) => {
      try {
        console.log(`🏠 Join chat request: ${data.chatId} by user ${socket.userId}`);
        const { chatId } = data;
        
        if (!socket.userId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        const chat = await chatService.getChatById(chatId);
        if (!chat || !chat.isActive) {
          socket.emit('error', { message: 'Chat not found or inactive' });
          return;
        }

        const hasAccess = await chatService.validateChatAccess(chatId, socket.userId);
        if (!hasAccess) {
          console.log(`User ${socket.userId} not authorized for chat ${chatId}`);
          socket.emit('error', { message: 'Not authorized to join this chat' });
          return;
        }

        socket.join(chatId);
        console.log(`User ${socket.userId} joined ${chat.chatType} chat ${chatId}`);
        
        socket.emit('joinedChat', { 
          chatId,
          chatType: chat.chatType,
          message: `Successfully joined ${chat.chatType} chat`
        });

        socket.to(chatId).emit('userJoinedChat', {
          userId: socket.userId,
          chatId,
          chatType: chat.chatType
        });

        // For group chats, notify about all participants
        if (chat.chatType === 'group') {
          socket.emit('groupChatInfo', {
            chatId,
            name: chat.name,
            participants: chat.participants.map(p => p._id.toString())
          });
        }

      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    socket.on('sendMessage', async (data: {
      chatId: string;
      content: string;
      tempId?: string;
    }) => {
      try {
        console.log(`Message from ${socket.userId} to chat ${data.chatId}`);
        const { chatId, content, tempId } = data;
        
        if (!socket.userId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        if (!content.trim()) {
          socket.emit('error', { message: 'Message content cannot be empty' });
          return;
        }

        const hasAccess = await chatService.validateChatAccess(chatId, socket.userId);
        if (!hasAccess) {
          socket.emit('error', { message: 'Not authorized to send message to this chat' });
          return;
        }

        const message = await chatService.addMessage(chatId, socket.userId, content);
        
        io.to(chatId).emit('newMessage', {
          chatId,
          message
        });

        socket.emit('messageSent', {
          chatId,
          messageId: message._id,
          tempId,
          success: true
        });

        console.log(`Message sent to ${chatId}`);
        
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', (data: { chatId: string }) => {
      const { chatId } = data;
      console.log(`User ${socket.userId} typing in chat ${chatId}`);
      socket.to(chatId).emit('userTyping', {
        userId: socket.userId,
        chatId
      });
    });

    socket.on('stopTyping', (data: { chatId: string }) => {
      const { chatId } = data;
      console.log(`User ${socket.userId} stopped typing in chat ${chatId}`);
      socket.to(chatId).emit('userStoppedTyping', {
        userId: socket.userId,
        chatId
      });
    });

    socket.on('markAsRead', async (data: { chatId: string }) => {
      try {
        const { chatId } = data;
        console.log(`User ${socket.userId} marking messages as read in chat ${chatId}`);
        
        if (!socket.userId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        await chatService.markMessagesAsRead(chatId, socket.userId);
        
        socket.to(chatId).emit('messagesRead', {
          chatId,
          userId: socket.userId,
          timestamp: new Date()
        });

        console.log(`Messages marked as read in chat ${chatId}`);
        
      } catch (error) {
        console.error('Error marking messages as read:', error);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.id}, UserId: ${socket.userId}, Reason: ${reason}`);
      console.log(`Remaining connected clients: ${io.engine.clientsCount - 1}`);
      
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        
        socket.broadcast.emit('userStatus', {
          userId: socket.userId,
          status: 'offline',
          lastSeen: new Date()
        });
      }
    });

    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  io.on('error', (error) => {
    console.error('Socket.IO Server Error:', error);
  });

  console.log('Socket.IO server configured successfully for chat');
  return io;
}