import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError, timer } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Socket, io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 2000;
  private connectionPromise: Promise<void> | null = null;

  constructor() { }

  connect(token: string): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    if (this.socket && this.socket.connected) {
      return Promise.resolve();
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        if (this.socket) {
          this.socket.removeAllListeners();
          this.socket.disconnect();
        }

        this.socket = io(environment.baseUrl, {
          auth: { token },
          withCredentials: true,
          transports: ['websocket', 'polling'],
          timeout: 20000,
          forceNew: true,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectInterval,
          autoConnect: false,
          secure: environment.production,
          rejectUnauthorized: false,
          path: '/socket.io/',
        });

        const connectionTimeout = setTimeout(() => {
          this.connectionPromise = null;
          reject(new Error('Socket connection timeout'));
        }, 25000);

        this.socket.on('connect', () => {
          clearTimeout(connectionTimeout);
          // console.log('Connected to socket server');
          // console.log('Socket ID:', this.socket.id);
          // console.log('Socket connected:', this.socket.connected);
          this.connectionStatusSubject.next(true);
          this.reconnectAttempts = 0;
          this.connectionPromise = null;
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          // console.log('Disconnected from socket server:', reason);
          this.connectionStatusSubject.next(false);

          if (reason === 'io server disconnect') {
            return;
          }

          this.handleReconnection(token);
        });

        this.socket.on('connect_error', (error) => {
          clearTimeout(connectionTimeout);
          console.error('Socket connection error:', error);
          console.error('Error details:', {
            message: error.message
          });

          console.error('Connection attempt details:', {
            url: environment.baseUrl,
            token: token ? `${token.substring(0, 10)}...` : 'No token',
            connected: this.socket?.connected,
            id: this.socket?.id
          });

          this.connectionStatusSubject.next(false);
          this.connectionPromise = null;
          reject(error);
        });

        this.socket.on('error', (error) => {
          console.error('Socket error:', error);
        });

        this.socket.on('reconnect', (attemptNumber) => {
          // console.log('Reconnected after', attemptNumber, 'attempts');
          this.connectionStatusSubject.next(true);
          this.reconnectAttempts = 0;
        });

        this.socket.on('reconnect_error', (error) => {
          console.error('Reconnection error:', error);
        });

        this.socket.on('reconnect_failed', () => {
          console.error('Reconnection failed after maximum attempts');
          this.connectionStatusSubject.next(false);
        });

        this.socket.connect();

      } catch (error) {
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  private handleReconnection(token: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      // console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect(token).catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
      this.connectionStatusSubject.next(false);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }
    this.connectionStatusSubject.next(false);
    this.connectionPromise = null;
  }

  testConnection(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log('Testing connection to:', environment.baseUrl);
      // console.log('Using token:', token ? 'Token provided' : 'No token');
      // console.log('Token length:', token ? token.length : 0);
      // console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');

      if (token) {
        const parts = token.split('.');
        // console.log('Token parts count:', parts.length);
        if (parts.length !== 3) {
          console.error('Invalid JWT format - should have 3 parts separated by dots');
          reject({ success: false, error: 'Invalid JWT format' });
          return;
        }
      }

      const testSocket = io(environment.baseUrl, {
        auth: { token },
        transports: ['polling'],
        timeout: 10000,
        forceNew: true,
        autoConnect: false
      });

      testSocket.on('connect', () => {
        // console.log('Test connection successful');
        testSocket.disconnect();
        resolve({ success: true, message: 'Connection test passed' });
      });

      testSocket.on('connect_error', (error) => {
        console.error('Test connection failed:', error);
        console.error('Error type:', typeof error);
        console.error('Error properties:', Object.keys(error));
        testSocket.disconnect();
        reject({ success: false, error: error.message });
      });

      testSocket.connect();
    });
  }

  async emit(event: string, data: any): Promise<void> {
    if (!this.socket) {
      throw new Error('Socket not initialized');
    }

    if (!this.socket.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit(event, data);
  }

  emitSafe(event: string, data: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
    }
  }

  listen<T>(event: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      if (!this.socket) {
        subscriber.error(new Error('Socket not initialized'));
        return;
      }

      const handler = (data: T) => {
        subscriber.next(data);
      };

      this.socket.on(event, handler);

      return () => {
        if (this.socket) {
          this.socket.off(event, handler);
        }
      };
    });
  }

  listenSafe<T>(event: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      if (!this.socket) {
        subscriber.error(new Error('Socket not initialized'));
        return;
      }

      if (!this.socket.connected) {
        const connectionSub = this.connectionStatus$.subscribe(connected => {
          if (connected && this.socket) {
            const handler = (data: T) => {
              subscriber.next(data);
            };

            this.socket.on(event, handler);

            subscriber.add(() => {
              if (this.socket) {
                this.socket.off(event, handler);
              }
              connectionSub.unsubscribe();
            });
          }
        });
      } else {
        const handler = (data: T) => {
          subscriber.next(data);
        };

        this.socket.on(event, handler);

        subscriber.add(() => {
          if (this.socket) {
            this.socket.off(event, handler);
          }
        });
      }
    });
  }

  isConnected(): boolean {
    return this.socket && this.socket.connected;
  }

  waitForConnection(): Promise<void> {
    if (this.isConnected()) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 30000);

      const subscription = this.connectionStatus$.subscribe(connected => {
        if (connected) {
          clearTimeout(timeout);
          subscription.unsubscribe();
          resolve();
        }
      });
    });
  }

  // Person-to-person chat specific methods
  joinChat(chatId: string, chatType: 'personal' | 'group' = 'personal'): void {
    this.emitSafe('joinChat', { chatId, chatType });
  }

  sendMessage(chatId: string, content: string, chatType: 'personal' | 'group' = 'personal'): void {
    this.emitSafe('sendMessage', { chatId, content, chatType });
  }

  markAsRead(chatId: string, chatType: 'personal' | 'group' = 'personal'): void {
    this.emitSafe('markAsRead', { chatId, chatType });
  }

  startTyping(chatId: string, chatType: 'personal' | 'group' = 'personal'): void {
    this.emitSafe('typing', { chatId, chatType });
  }

  stopTyping(chatId: string, chatType: 'personal' | 'group' = 'personal'): void {
    this.emitSafe('stopTyping', { chatId, chatType });
  }

  joinGroupChat(chatId: string): void {
    this.emitSafe('joinChat', { chatId, chatType: 'group' });
  }

  sendGroupMessage(chatId: string, content: string): void {
    this.emitSafe('sendMessage', { chatId, content, chatType: 'group' });
  }

  startGroupTyping(chatId: string): void {
    this.emitSafe('typing', { chatId, chatType: 'group' });
  }

  stopGroupTyping(chatId: string): void {
    this.emitSafe('stopTyping', { chatId, chatType: 'group' });
  }

  markGroupAsRead(chatId: string): void {
    this.emitSafe('markAsRead', { chatId, chatType: 'group' });
  }
}