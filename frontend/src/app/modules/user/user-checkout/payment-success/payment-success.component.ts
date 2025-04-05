import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  imports: [CommonModule],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css',
  animations: [
    trigger('popIn', [
      transition(':enter', [
        style({ transform: 'scale(0.5)', opacity: 0 }),
        animate('300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
          style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms 200ms ease-out', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('checkmarkDraw', [
      transition(':enter', [
        style({ strokeDasharray: 24, strokeDashoffset: 24 }),
        animate('600ms 400ms ease-out', 
          style({ strokeDashoffset: 0 }))
      ])
    ])
  ],
})
export class PaymentSuccessComponent implements OnInit{
  constructor(private router: Router) {}
  today = new Date();
  orderId: string='BK-3456789098765'
  confettiPieces: any[] = [];
  ngOnInit() {
    this.generateConfetti();
    setTimeout(() => {
      this.router.navigate(['/profile']);
    }, 5000);
  }
  goToHome() {
    this.router.navigate(['/']);
  }
  downloadTickets() {
    // Your download logic
  }
  generateConfetti() {
    const colors = ['#4ade80', '#22d3ee', '#f472b6', '#fbbf24', '#a78bfa'];
    for (let i = 0; i < 50; i++) {
      this.confettiPieces.push({
        style: {
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${2 + Math.random() * 3}s`,
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          width: `${6 + Math.random() * 6}px`,
          height: `${6 + Math.random() * 6}px`,
          transform: `rotate(${Math.random() * 360}deg)`
        }
      });
    }
  }

}
