import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import Notiflix from 'notiflix';
import { Subject, takeUntil } from 'rxjs';
import { UserProfileService } from '../../../../core/services/user/profile/user.profile.service';
import { IBooking, ITicket } from '../../../../core/models/booking.interface';
import { IEvent } from '../../../../core/models/event.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.bookings.component.html',
  styleUrl: './profile.bookings.component.css',
})
export class ProfileBookingsComponent implements OnInit, OnDestroy {
  bookings: IBooking[] = [];
  showModal = false;
  showBookingDetailsModal = false;
  showQRModal = false;
  selectedBookingId = '';
  selectedTicket: ITicket | null = null;
  selectedBooking: IBooking | null = null;

  currentPage = 1;
  limit = 10;
  isLoading = false;
  hasMore = true;
  totalCount = 0;

  private _destroy$ = new Subject<void>();

  constructor(private _userProfileService: UserProfileService, private router: Router) {}

  ngOnInit(): void {
    this._loadUserBookings();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    // Trigger loading when within 100 pixels of the bottom
    if (scrollTop + windowHeight >= documentHeight - 100 && this.hasMore && !this.isLoading) {
      this.loadMoreBookings();
    }
  }

  showBookingDetails(booking: IBooking): void {
    this.selectedBooking = booking;
    this.showBookingDetailsModal = true;
  }

  hideBookingDetailsModal(): void {
    this.showBookingDetailsModal = false;
    this.selectedBooking = null;
  }

  showQRCode(ticket: ITicket): void {
    this.selectedTicket = ticket;
    this.showQRModal = true;
  }

  hideQRModal(): void {
    this.showQRModal = false;
    this.selectedTicket = null;
  }

  showCancellationModal(bookingId: string, ticket: ITicket): void {
    this.showBookingDetailsModal = false;
    this.selectedBookingId = bookingId;
    this.selectedTicket = ticket;
    this.showModal = true;
  }

  hideModal(): void {
    this.showModal = false;
  }

  downloadTicket(booking: IBooking): void {
    Notiflix.Notify.info('Downloading your tickets...');
    setTimeout(() => {
      Notiflix.Notify.success('Tickets downloaded successfully!');
    }, 1500);
  }

  proceedWithCancellation(): void {
    this.hideModal();

    if (!this.selectedBookingId || !this.selectedTicket) {
      return;
    }

    const bookingEventDate = this.selectedBooking?.event?.startDate;
    const currentDate = new Date();

    if (bookingEventDate) {
      const eventDate = new Date(bookingEventDate);

      if (currentDate >= eventDate) {
        Notiflix.Notify.failure('You cannot cancel tickets for events that have already started');
        return;
      }
    }

    const ticketPrice = this.selectedTicket.price;
    const refundAmount = Math.floor((ticketPrice * 0.9) * this.selectedTicket.quantity);

    Notiflix.Confirm.show(
      'Confirm Cancellation',
      `Are you sure you want to cancel ${this.selectedTicket.quantity} ${this.selectedTicket.type} Tickets? ₹${refundAmount.toFixed(2)} will be credited to your wallet.`,
      'Yes, Cancel Ticket',
      'No, Keep Ticket',
      () => this._cancelTicket(refundAmount),
      () => this._resetCancellationState(),
      {
        width: '320px',
        borderRadius: '8px',
        titleColor: '#ff5549',
        messageColor: '#ffffff',
        okButtonBackground: '#ff5549',
        cancelButtonBackground: '#4b5563',
        backgroundColor: '#1E1E1E',
        messageMaxLength: 1000,
      }
    );
  }

  private _loadUserBookings(loadMore: boolean = false): void {
    if (this.isLoading) return;

    this.isLoading = true;

    this._userProfileService
      .getUserBookings(this.currentPage, this.limit)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          if (response.success) {
            const { bookings, totalCount, hasMore } = response.data;

            if (loadMore) {
              this.bookings = [...this.bookings, ...bookings];
            } else {
              this.bookings = bookings;
            }

            this.totalCount = totalCount;
            this.hasMore = hasMore;
          } else {
            Notiflix.Notify.failure('Failed to load your events.');
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error loading events:', error);
          Notiflix.Notify.failure('Error loading your events.');
        },
      });
  }

  loadMoreBookings(): void {
    if (this.hasMore && !this.isLoading) {
      this.currentPage++;
      this._loadUserBookings(true);
    }
  }

  private _cancelTicket(refundAmount: number): void {
    if (!this.selectedBookingId || !this.selectedTicket) {
      return;
    }

    this._userProfileService
      .cancelTicket(this.selectedBookingId, this.selectedTicket.uniqueId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this.currentPage = 1;
          this.bookings = [];
          this._loadUserBookings();
          Notiflix.Notify.success('Ticket cancelled successfully. Amount credited to your wallet.');
        },
        error: (err) => {
          console.error('Error cancelling ticket:', err);
          Notiflix.Notify.failure('Failed to cancel ticket. Please try again.');
        },
      });
  }

  private _resetCancellationState(): void {
    this.selectedBookingId = '';
    this.selectedTicket = null;
  }

  watchLive(event: IEvent): void {
    this.router.navigate(['/live-stream'], {
      queryParams: { role: 'audience', eventId: event._id },
    });
  }
}