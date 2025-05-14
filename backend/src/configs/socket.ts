import { Server, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import * as admin from 'firebase-admin';
import { container, injectable } from 'tsyringe';
import { ChatService } from '../../src/services/implementation/user/chat/chat.service';
import { GroupChatService } from '../../src/services/implementation/user/chat/group.service';

@injectable()
export class SocketConfig {
  private io: Server;

  constructor() {
 }

  public initializeSocket(httpServer: HTTPServer): Server {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_SERVER,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      },
    });

    this.io.use(async (socket: Socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        socket.data.user = { id: decodedToken.uid }; 
        next();
      } catch (err) {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const userId = socket.data.user.id;
      const chatService = container.resolve(ChatService);
      const groupChatService = container.resolve(GroupChatService);

      socket.join(`user:${userId}`);

      groupChatService.getUserGroupChats(userId).then((groupChats: any[]) => {
        groupChats.forEach((groupChat: { _id: any; }) => {
          socket.join(`group:${groupChat._id}`);
        });
      });

      socket.on('sendMessage', async ({ chatId, content }) => {
        try {
          const message = await chatService.sendMessage(chatId, userId, content);
          const recipientIds = (await chatService.getChat(chatId)).participants.filter(
            (id: { toString: () => any; }) => id.toString() !== userId,
          );
          recipientIds.forEach((recipientId: any) => {
            this.io.to(`user:${recipientId}`).emit('receiveMessage', message);
          });
          socket.emit('receiveMessage', message);
        } catch (err) {
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      socket.on('sendGroupMessage', async ({ groupChatId, content }) => {
        try {
          const message = await groupChatService.sendGroupMessage(groupChatId, userId, content);
          this.io.to(`group:${groupChatId}`).emit('receiveGroupMessage', message);
        } catch (err) {
          socket.emit('error', { message: 'Failed to send group message' });
        }
      });

      socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected`);
      });
    });

    return this.io;
  }

  public getIo(): Server {
    return this.io;
  }
}