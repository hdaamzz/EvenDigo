import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { LucideAngularModule, X, Calendar, MapPin, Users, Share2, Heart } from 'lucide-angular';
import { IEvent } from '../../../../core/models/event.interface';
import { UserDashboardService } from '../../../../core/services/user/dashboard/user.dashboard.service';
import { catchError, of, tap } from 'rxjs';
import Notiflix from 'notiflix';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-detail-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './event-detail-modal.component.html',
  styleUrls: ['./event-detail-modal.component.css'],
  animations: [
    trigger('fade', [
      transition(':enter', [style({ opacity: 0 }), animate('300ms', style({ opacity: 1 }))]),
      transition(':leave', [animate('300ms', style({ opacity: 0 }))]),
    ]),
    trigger('modal', [
      transition(':enter', [style({ opacity: 0, transform: 'scale(0.9)' }), animate('300ms', style({ opacity: 1, transform: 'scale(1)' }))]),
      transition(':leave', [animate('300ms', style({ opacity: 0, transform: 'scale(0.9)' }))]),
    ]),
  ],
})
export class EventDetailModalComponent implements OnInit, OnDestroy {
  @Input() id!: string;
  @Output() close = new EventEmitter<void>();
  @ViewChild('modalRef') modalRef!: ElementRef;

  eventData!: IEvent;
  isLoading = true;
  liked = false;
  ticketCounts: { [key: string]: number } = { regular: 0, vip: 0, gold: 0 };
  totalTickets: number = 0;
  maxTicketsPerUser: number = 5;

  constructor(
    private dashboardService: UserDashboardService,
    private router: Router
  ) {}

  ngOnInit() {
    this.showEventDetails(this.id);
    document.addEventListener('mousedown', this.handleClickOutside.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('mousedown', this.handleClickOutside.bind(this));
  }

  showEventDetails(id: string) {
    this.isLoading = true;
    this.dashboardService.getEventById(id).pipe(
      tap((response) => {
        this.eventData = response.data;
        this.isLoading = false;
        // Initialize ticket counts based on available ticket types
        this.eventData.tickets.forEach((ticket: any) => {
          const type = ticket.type.toLowerCase();
          if (!this.ticketCounts[type]) {
            this.ticketCounts[type] = 0;
          }
        });
        console.log(this.eventData);
      }),
      catchError((error) => {
        console.error('Error fetching event:', error);
        Notiflix.Notify.failure('Error fetching event details');
        this.isLoading = false;
        return of(null);
      })
    ).subscribe();
  }

  handleClose() {
    this.close.emit();
  }

  toggleLike() {
    this.liked = !this.liked;
  }

  handleClickOutside(event: MouseEvent) {
    if (this.modalRef && !this.modalRef.nativeElement.contains(event.target as Node)) {
      this.handleClose();
    }
  }

  incrementTicket(index: number): void {
    const ticket = this.eventData.tickets[index];
    const ticketType = ticket.type.toLowerCase();
    if (this.totalTickets < this.maxTicketsPerUser && this.ticketCounts[ticketType] < ticket.quantity) {
      this.ticketCounts[ticketType]++;
      this.totalTickets = Object.values(this.ticketCounts).reduce((sum, count) => sum + count, 0);
    } else if (this.totalTickets >= this.maxTicketsPerUser) {
      Notiflix.Notify.warning(`You can only purchase up to ${this.maxTicketsPerUser} tickets.`);
    }
  }

  decrementTicket(index: number): void {
    const ticket = this.eventData.tickets[index];
    const ticketType = ticket.type.toLowerCase();
    if (this.ticketCounts[ticketType] > 0) {
      this.ticketCounts[ticketType]--;
      this.totalTickets = Object.values(this.ticketCounts).reduce((sum, count) => sum + count, 0);
    }
  }

  calculateTotal(): number {
    let total = 0;
    this.eventData.tickets.forEach((ticket: any) => {
      const type = ticket.type.toLowerCase();
      total += this.ticketCounts[type] * ticket.price;
    });
    return total;
  }

  proceedToCheckout(): void {
    if (this.totalTickets === 0) {
      Notiflix.Notify.warning('Please select at least one ticket to proceed.');
      return;
    }

    // Prepare ticket data for checkout
    const ticketFormData = {
      tickets: this.ticketCounts,
      totalAmount: this.calculateTotal(),
      eventId: this.id,
      eventTitle: this.eventData.eventTitle,
    };
    // Navigate to checkout page with ticket data
    this.router.navigate(['/checkout'], { state: { ticketData: ticketFormData } });
    this.handleClose(); 
  }

  readonly X = X;
  readonly Calendar = Calendar;
  readonly MapPin = MapPin;
  readonly Users = Users;
  readonly Share2 = Share2;
  readonly Heart = Heart;
}