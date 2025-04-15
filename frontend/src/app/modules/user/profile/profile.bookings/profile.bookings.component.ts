import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Notiflix from 'notiflix';
import { UserProfileService } from '../../../../core/services/user/profile/user.profile.service';
import { IBooking, ITicket } from '../../../../core/models/booking.interface';

@Component({
  selector: 'app-profile.bookings',
  imports: [CommonModule],
  templateUrl: './profile.bookings.component.html',
  styleUrl: './profile.bookings.component.css'
})
export class ProfileBookingsComponent implements OnInit{
  bookings: IBooking[] = [];


  showModal: boolean = false;
  showBookingDetailsModal: boolean = false;
  showQRModal: boolean = false;


  selectedBookingId: string = '';
  selectedTicket: ITicket | null = null;
  selectedBooking: IBooking | null = null;
  
  constructor(private userProfileService: UserProfileService) {}
  
  ngOnInit() {
    this.loadUserEvents();
  }
  
  loadUserEvents() {
    this.userProfileService.getUserBookings().subscribe({
      next: (response) => {
        if (response.success) {
          this.bookings = response.data;
        } else {
          Notiflix.Notify.failure('Failed to load your events.');
        }
      },
      error: (error) => {
        console.error('Error loading events:', error);
        Notiflix.Notify.failure('Error loading your events.');
      },
    });
  }

  showBookingDetails(booking: IBooking) {
    this.selectedBooking = booking;
    this.showBookingDetailsModal = true;
  }
  
  hideBookingDetailsModal() {
    this.showBookingDetailsModal = false;
    this.selectedBooking = null;
  }
  
  showQRCode(ticket: ITicket) {
    this.selectedTicket = ticket;
    this.showQRModal = true;
  }
  
  hideQRModal() {
    this.showQRModal = false;
    this.selectedTicket = null;
  }
  



  showCancellationModal(bookingId: string, ticket: ITicket) {
    this.showBookingDetailsModal = false;
    this.selectedBookingId = bookingId;
    this.selectedTicket = ticket;
    this.showModal = true;    
  }

  hideModal() {
    this.showModal = false;
  }

  downloadTicket(booking: IBooking) {
    Notiflix.Notify.info('Downloading your tickets...');
    // Implement the download logic or API call here
    setTimeout(() => {
      Notiflix.Notify.success('Tickets downloaded successfully!');
    }, 1500);
  }


  proceedWithCancellation() {
    this.hideModal();
    console.log("cancell");
    
    if (!this.selectedBookingId || !this.selectedTicket) {
      return;
    }
    
    const ticketPrice = this.selectedTicket.price;
    const refundAmount = Math.floor((ticketPrice * 0.9)*this.selectedTicket.quantity);
    console.log(ticketPrice,refundAmount); 
    
    Notiflix.Confirm.show(
      'Confirm Cancellation',
      `Are you sure you want to cancel ${this.selectedTicket.quantity} ${this.selectedTicket.type} Tickets  ₹${refundAmount.toFixed(2)} will be credited to your wallet.`,
      'Yes, Cancel Ticket',
      'No, Keep Ticket',
      () => {
        this.userProfileService.cancelTicket(this.selectedBookingId, this.selectedTicket!.uniqueId).subscribe({
          next: (response) => {
            this.loadUserEvents();
            Notiflix.Notify.success('Ticket cancelled successfully. Amount credited to your wallet.');
          },  
          error: (err) => {
            console.error('Error cancelling ticket:', err);
            Notiflix.Notify.failure('Failed to cancel ticket. Please try again.');
          }
        });
      },
      () => {
            this.selectedBookingId = '';
            this.selectedTicket = null;
        console.log('Ticket cancellation aborted');
      },
      {
        width: '320px',
        borderRadius: '8px',
        titleColor: '#ff5549',
        messageColor: '#ffffff',
        okButtonBackground: '#ff5549',
        cancelButtonBackground: '#4b5563',
        backgroundColor: '#1E1E1E',
        messageMaxLength: 1000
      }
    );
  }
}
