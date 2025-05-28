import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { ChatService } from '../../src/services/implementation/user/chat/chat.service';
import { container } from 'tsyringe';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export default function configureSocketIO(server: HttpServer): SocketIOServer {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_SERVER,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  const chatService = container.resolve<ChatService>('ChatService');
  const onlineUsers = new Map<string, string>();

  // Authentication middleware for socket
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      socket.userId = decoded.id || decoded.userId;
      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.id}, UserId: ${socket.userId}`);

    if (socket.userId) {
      onlineUsers.set(socket.userId, socket.id);
      socket.join(socket.userId);
      
      // Emit online status to all users
      socket.broadcast.emit('userStatus', { userId: socket.userId, status: 'online' });
      
      // Join user to their personal chat rooms
      socket.emit('authenticated', { userId: socket.userId });
    }

    // Join specific chat room
    socket.on('joinChat', async (data: { chatId: string }) => {
      try {
        const { chatId } = data;
        
        // Verify user is participant in this chat
        const chat = await chatService.getChatById(chatId);
        const isParticipant = chat.participants.some(p => p.toString() === socket.userId);
        
        if (isParticipant) {
          socket.join(chatId);
          console.log(`User ${socket.userId} joined chat ${chatId}`);
          socket.emit('joinedChat', { chatId });
        } else {
          socket.emit('error', { message: 'Not authorized to join this chat' });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle sending messages
    socket.on('sendMessage', async (data: {
      chatId: string;
      content: string;
      chatType?: 'personal' | 'event';
    }) => {
      try {
        const { chatId, content, chatType } = data;
        
        if (!socket.userId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        // Validate message content
        if (!content.trim()) {
          socket.emit('error', { message: 'Message content cannot be empty' });
          return;
        }

        const message = await chatService.addMessage(chatId, socket.userId, content);
        
        // Emit to all users in the chat room
        io.to(chatId).emit('newMessage', {
          chatId,
          message,
          chatType
        });

        // Send push notification to offline users (if needed)
        // const chat = await chatService.getChatById(chatId);
        // const offlineParticipants = chat.participants.filter(p => 
        //   p.toString() !== socket.userId && !onlineUsers.has(p.toString())
        // );

        // Here you can implement push notification logic for offline users
        
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle joining event chat automatically
    socket.on('joinEventChat', async (data: { eventId: string }) => {
      try {
        const { eventId } = data;
        
        if (!socket.userId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        const eventChat = await chatService.joinEventChat(eventId, socket.userId) as { _id: string };
        socket.join(eventChat._id.toString());
        
        // Notify other participants
        socket.to(eventChat._id.toString()).emit('userJoinedEventChat', {
          userId: socket.userId,
          eventId,
          chatId: eventChat._id
        });

        socket.emit('joinedEventChat', {
          chat: eventChat,
          message: 'Successfully joined event chat'
        });

      } catch (error) {
        console.error('Error joining event chat:', error);
        socket.emit('error', { message: 'Failed to join event chat' });
      }
    });

    // Handle leaving event chat
    socket.on('leaveEventChat', async (data: { eventId: string }) => {
      try {
        const { eventId } = data;
        
        if (!socket.userId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        await chatService.leaveEventChat(eventId, socket.userId);
        
        // Leave the socket room
        const eventChat = await chatService.getEventChat(eventId) as { _id: string };
        if (eventChat) {
          socket.leave(eventChat._id.toString());
          
          // Notify other participants
          socket.to(eventChat._id.toString()).emit('userLeftEventChat', {
            userId: socket.userId,
            eventId
          });
        }

        socket.emit('leftEventChat', {
          eventId,
          message: 'Successfully left event chat'
        });

      } catch (error) {
        console.error('Error leaving event chat:', error);
        socket.emit('error', { message: 'Failed to leave event chat' });
      }
    });

    // Handle marking messages as read
    socket.on('markAsRead', async (data: { chatId: string }) => {
      try {
        const { chatId } = data;
        
        if (!socket.userId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        await chatService.markMessagesAsRead(chatId, socket.userId);
        
        // Notify other participants that messages were read
        socket.to(chatId).emit('messagesRead', {
          chatId,
          userId: socket.userId,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('Error marking messages as read:', error);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data: { chatId: string }) => {
      const { chatId } = data;
      socket.to(chatId).emit('userTyping', {
        userId: socket.userId,
        chatId
      });
    });

    socket.on('stopTyping', (data: { chatId: string }) => {
      const { chatId } = data;
      socket.to(chatId).emit('userStoppedTyping', {
        userId: socket.userId,
        chatId
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}, UserId: ${socket.userId}`);
      
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        socket.broadcast.emit('userStatus', {
          userId: socket.userId,
          status: 'offline',
          lastSeen: new Date()
        });
      }
    });
  });

  return io;
}