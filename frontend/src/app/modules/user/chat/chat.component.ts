import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketService } from '../../../core/services/user/socket/socket.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  imports: [CommonModule,FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy {
  message = '';
  messages: string[] = [];

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    const userId = 'get-from-localStorage-or-auth';
    this.socketService.connect(userId);

    this.socketService.listen<string>('receive-message').subscribe((msg) => {
      this.messages.push(msg);
    });
  }


  sendMessage(): void {
    if (this.message.trim()) {
      this.socketService.emit('send-message', this.message);
      this.message = '';
    }
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }
}