import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { LucideAngularModule, X, Calendar, MapPin, Users, Share2, Heart, MessageCircle } from 'lucide-angular';
import { Router } from '@angular/router';
import { Subject, catchError, of, takeUntil, tap } from 'rxjs';
import Notiflix from 'notiflix';

import { IEvent } from '../../../../core/models/event.interface';
import { UserDashboardService } from '../../../../core/services/user/dashboard/user.dashboard.service';

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
  @Output() chat = new EventEmitter<string>(); // Emit organizer ID for chat
  @ViewChild('modalRef') modalRef!: ElementRef;

  eventData!: IEvent;
  isLoading = true;
  liked = false;
  ticketCounts: { [key: string]: number } = { regular: 0, vip: 0, gold: 0 };
  totalTickets = 0;
  readonly maxTicketsPerUser = 5;

  // Lucide icons
  readonly X = X;
  readonly Calendar = Calendar;
  readonly MapPin = MapPin;
  readonly Users = Users;
  readonly Share2 = Share2;
  readonly Heart = Heart;
  readonly MessageCircle = MessageCircle;

  private readonly _destroy$ = new Subject<void>();
  private readonly _handleClickOutside = this._clickOutsideHandler.bind(this);

  constructor(
    private readonly _dashboardService: UserDashboardService,
    private readonly _router: Router
  ) {}

  ngOnInit(): void {
    this._fetchEventDetails(this.id);
    document.addEventListener('mousedown', this._handleClickOutside);
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousedown', this._handleClickOutside);
    this._destroy$.next();
    this._destroy$.complete();
  }

  handleClose(): void {
    this.close.emit();
  }

  toggleLike(): void {
    this.liked = !this.liked;
  }

  handleChat(): void {
    this.chat.emit(this.eventData.user_id._id);
  }

  shareEvent(): void {
    if (navigator.share) {
      navigator.share({
        title: this.eventData.eventTitle,
        text: this.eventData.eventDescription,
        url: window.location.href
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        Notiflix.Notify.success('Event link copied to clipboard!');
      }).catch(() => {
        Notiflix.Notify.failure('Failed to copy link');
      });
    }
  }

  incrementTicket(index: number): void {
    const ticket = this.eventData.tickets[index];
    const ticketType = ticket.type.toLowerCase();
    
    if (this.totalTickets < this.maxTicketsPerUser && this.ticketCounts[ticketType] < ticket.quantity) {
      this.ticketCounts[ticketType]++;
      this._updateTotalTickets();
    } else if (this.totalTickets >= this.maxTicketsPerUser) {
      Notiflix.Notify.warning(`You can only purchase up to ${this.maxTicketsPerUser} tickets.`);
    }
  }

  decrementTicket(index: number): void {
    const ticket = this.eventData.tickets[index];
    const ticketType = ticket.type.toLowerCase();
    
    if (this.ticketCounts[ticketType] > 0) {
      this.ticketCounts[ticketType]--;
      this._updateTotalTickets();
    }
  }

  calculateTotal(): number {
    if (!this.eventData?.tickets) return 0;
    
    return this.eventData.tickets.reduce((total, ticket) => {
      const type = ticket.type.toLowerCase();
      return total + (this.ticketCounts[type] * ticket.price);
    }, 0);
  }

  getRemainingTickets(ticket: any): number {
    const ticketType = ticket.type.toLowerCase();
    return ticket.quantity - (this.ticketCounts[ticketType] || 0);
  }

  proceedToCheckout(): void {
    if (this.totalTickets === 0) {
      Notiflix.Notify.warning('Please select at least one ticket to proceed.');
      return;
    }

    const ticketFormData = {
      tickets: this.ticketCounts,
      totalAmount: this.calculateTotal(),
      eventId: this.id,
      eventTitle: this.eventData.eventTitle,
    };

    this._router.navigate(['/checkout'], { state: { ticketData: ticketFormData } });
    this.handleClose();
  }

  private _fetchEventDetails(id: string): void {
    this.isLoading = true;
    
    this._dashboardService.getEventById(id)
      .pipe(
        tap((response) => {
          if (response.data) {
            this.eventData = response.data;
            this._initializeTicketCounts();
            this.isLoading = false;
          }
        }),
        catchError((error) => {
          console.error('Error fetching event:', error);
          Notiflix.Notify.failure('Error fetching event details');
          this.isLoading = false;
          return of(null);
        }),
        takeUntil(this._destroy$)
      )
      .subscribe();
  }

  private _initializeTicketCounts(): void {
    if (!this.eventData?.tickets) return;
    
    this.eventData.tickets.forEach((ticket: any) => {
      const type = ticket.type.toLowerCase();
      if (!this.ticketCounts[type]) {
        this.ticketCounts[type] = 0;
      }
    });
  }

  private _updateTotalTickets(): void {
    this.totalTickets = Object.values(this.ticketCounts).reduce((sum, count) => sum + count, 0);
  }

  private _clickOutsideHandler(event: MouseEvent): void {
    if (this.modalRef && !this.modalRef.nativeElement.contains(event.target as Node)) {
      this.handleClose();
    }
  }
  onChatWithOrganizer(organizerId: string) {
  this._router.navigate(['/chat', organizerId]);
  }
}