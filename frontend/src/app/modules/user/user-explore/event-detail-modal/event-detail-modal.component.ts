import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, EventEmitter, Output, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { LucideAngularModule, X, Calendar, MapPin, Users, Share2, Heart, MessageCircle, ArrowRight, Shield, ChevronUp, ChevronDown } from 'lucide-angular';
import { Router } from '@angular/router';
import { Subject, catchError, of, takeUntil, tap, finalize } from 'rxjs';
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
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0 }))
      ]),
    ]),
    trigger('modal', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(10px)' }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0px)' }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'scale(0.95) translateY(10px)' }))
      ]),
    ]),
  ],
})
export class EventDetailModalComponent implements OnInit, OnDestroy {
  @Input() id!: string;
  @Output() close = new EventEmitter<void>();
  @Output() chat = new EventEmitter<string>();
  @ViewChild('modalRef') modalRef!: ElementRef;

  eventData!: IEvent;
  isLoading = true;
  liked = false;
  showFullDescription = false;
  showEventDetails = false;
  ticketCounts: { [key: string]: number } = {};
  totalTickets = 0;
  readonly maxTicketsPerUser = 5;

  readonly X = X;
  readonly Calendar = Calendar;
  readonly MapPin = MapPin;
  readonly Users = Users;
  readonly Share2 = Share2;
  readonly Heart = Heart;
  readonly MessageCircle = MessageCircle;
  readonly ArrowRight = ArrowRight;
  readonly Shield = Shield;
  readonly ChevronUp = ChevronUp;
  readonly ChevronDown = ChevronDown;

  private readonly _destroy$ = new Subject<void>();
  private readonly _handleClickOutside = this._clickOutsideHandler.bind(this);

  constructor(
    private readonly _dashboardService: UserDashboardService,
    private readonly _router: Router,
    private readonly _cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    console.log('Component initialized with ID:', this.id);
    
    if (!this.id) {
      console.error('No ID provided to component');
      this.isLoading = false;
      return;
    }
    
    this._fetchEventDetails(this.id);
    document.addEventListener('mousedown', this._handleClickOutside);
    document.body.style.overflow = 'hidden'; 
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousedown', this._handleClickOutside);
    document.body.style.overflow = 'auto'; 
    this._destroy$.next();
    this._destroy$.complete();
  }

  handleClose(): void {
    this.close.emit();
  }

  toggleLike(): void {
    this.liked = !this.liked;
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }

  shareEvent(): void {
    const shareData = {
      title: this.eventData.eventTitle,
      text: `Check out this amazing event: ${this.eventData.eventTitle}`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      navigator.share(shareData).catch(console.error);
    } else {
      const textToCopy = `${this.eventData.eventTitle} - ${window.location.href}`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        Notiflix.Notify.success('Event link copied to clipboard!', {
          position: 'right-bottom',
          timeout: 2000,
        });
      }).catch(() => {
        Notiflix.Notify.failure('Failed to copy link');
      });
    }
  }

  incrementTicket(index: number): void {
    const ticket = this.eventData.tickets[index];
    const ticketType = ticket.type.toLowerCase();
    
    if (this.totalTickets >= this.maxTicketsPerUser) {
      Notiflix.Notify.warning(`Maximum ${this.maxTicketsPerUser} tickets allowed per person`, {
        position: 'right-bottom'
      });
      return;
    }
    
    if (this.ticketCounts[ticketType] >= ticket.quantity) {
      Notiflix.Notify.warning('No more tickets available for this type');
      return;
    }

    this.ticketCounts[ticketType] = (this.ticketCounts[ticketType] || 0) + 1;
    this._updateTotalTickets();
    this._addHapticFeedback();
  }

  decrementTicket(index: number): void {
    const ticket = this.eventData.tickets[index];
    const ticketType = ticket.type.toLowerCase();
    
    if (this.ticketCounts[ticketType] > 0) {
      this.ticketCounts[ticketType]--;
      this._updateTotalTickets();
      this._addHapticFeedback();
    }
  }

  calculateTotal(): number {
    if (!this.eventData?.tickets) return 0;
    
    return this.eventData.tickets.reduce((total, ticket) => {
      const type = ticket.type.toLowerCase();
      return total + ((this.ticketCounts[type] || 0) * ticket.price);
    }, 0);
  }

  getRemainingTickets(ticket: any): number {
    const ticketType = ticket.type.toLowerCase();
    return Math.max(0, ticket.quantity - (this.ticketCounts[ticketType] || 0));
  }

  getTicketDescription(type: string): string {
    const descriptions: { [key: string]: string } = {
      regular: 'Standard admission with basic amenities',
      vip: 'Premium experience with exclusive perks',
      gold: 'Ultimate luxury package with all benefits',
      platinum: 'Most exclusive tier with backstage access'
    };
    return descriptions[type.toLowerCase()] || 'Event admission';
  }

  getTicketBenefits(type: string): string[] {
    const benefits: { [key: string]: string[] } = {
      regular: [],
      vip: ['Priority seating', 'Welcome drink'],
      gold: ['Priority seating', 'Welcome drink', 'Meet & greet', 'Photo opportunity'],
      platinum: ['Priority seating', 'Welcome drink', 'Meet & greet', 'Photo opportunity', 'Backstage access', 'Exclusive merchandise']
    };
    return benefits[type.toLowerCase()] || [];
  }

  trackByTicketType(index: number, ticket: any): string {
    return ticket.type;
  }

  proceedToCheckout(): void {
    if (this.totalTickets === 0) {
      Notiflix.Notify.warning('Please select at least one ticket to proceed.', {
        position: 'right-bottom'
      });
      return;
    }

    Notiflix.Loading.standard('Preparing checkout...', {
      backgroundColor: 'rgba(0,0,0,0.8)',
    });

    const ticketFormData = {
      tickets: this.ticketCounts,
      totalAmount: this.calculateTotal(),
      eventId: this.id,
      eventTitle: this.eventData.eventTitle,
    };

    const queryParams = {
      eventId: ticketFormData.eventId,
      eventTitle: ticketFormData.eventTitle,
      totalAmount: ticketFormData.totalAmount.toString(),
      tickets: JSON.stringify(ticketFormData.tickets)
    };

    setTimeout(() => {
      Notiflix.Loading.remove();
      this._router.navigate(['/checkout'], { queryParams });
      this.handleClose();
    }, 1000);
  }

  async handleChat(organizerId: string): Promise<void> {
    try {
      this.handleClose();
      
      await this._router.navigate(['/chats'], { 
        queryParams: { userId: organizerId }
      });
    } catch (error) {
      console.error('Error navigating to chat:', error);
      Notiflix.Notify.failure('Failed to open chat');
    }
  }

  private _fetchEventDetails(id: string): void {
    this.isLoading = true;
    
    this._dashboardService.getEventById(id)
      .pipe(
        tap((response) => {
          if (response?.data) {
            this.eventData = response.data;
            this._initializeTicketCounts();
          }
        }),
        catchError((error) => {
          console.error('Error fetching event:', error);
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
          this._cdr.detectChanges();
        }),
        takeUntil(this._destroy$)
      )
      .subscribe({
        error: (err) => {
          console.error('Subscription error:', err);
          this.isLoading = false;
          this._cdr.detectChanges();
        },
      });
  }

  private _initializeTicketCounts(): void {
    if (!this.eventData?.tickets) return;
    
    this.ticketCounts = {};
    this.eventData.tickets.forEach((ticket: any) => {
      const type = ticket.type.toLowerCase();
      this.ticketCounts[type] = 0;
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

  private _addHapticFeedback(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  }
}
