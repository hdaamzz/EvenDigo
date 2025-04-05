import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Notiflix from 'notiflix';
import { UserProfileService } from '../../../../core/services/user/user.profile.service';

@Component({
  selector: 'app-profile.events',
  imports: [CommonModule],
  templateUrl: './profile.events.component.html',
  styleUrl: './profile.events.component.css'
})
export class ProfileEventsComponent {
    bookings: any[] = [];
  
    constructor(private userProfileService: UserProfileService) {}
  
    ngOnInit() {
      this.loadUserEvents();
    }
  
    loadUserEvents() {
      this.userProfileService.getUserEvents().subscribe({
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

    cancelTicket(bookingId: string, ticketPrice: number) {
      // Calculate refund amount (80% of ticket price)
      const refundAmount = ticketPrice * 0.8;
      const deductedAmount = ticketPrice * 0.2;
    
      // First show the terms and conditions modal
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-[#1E1E1E] rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-xl font-semibold text-white mb-4">Ticket Cancellation Terms</h3>
          
          <div class="mb-4 text-gray-300 text-sm space-y-3">
            <p>Please review our ticket cancellation policy before proceeding:</p>
            
            <div class="bg-[#2A2F3F] p-3 rounded-lg">
              <p class="font-medium text-white mb-1">Refund Policy</p>
              <p>• 80% of the ticket price (₹${refundAmount.toFixed(2)}) will be credited to your wallet</p>
              <p>• 20% cancellation fee (₹${deductedAmount.toFixed(2)}) will be deducted</p>
            </div>
            
            <div class="bg-[#2A2F3F] p-3 rounded-lg">
              <p class="font-medium text-white mb-1">Important Notes</p>
              <p>• Cancellation cannot be reversed once confirmed</p>
              <p>• Refund will be processed within 24-48 hours</p>
              <p>• Wallet credits can be used for future bookings</p>
            </div>
            
            <div class="bg-[#2A2F3F] p-3 rounded-lg">
              <p class="font-medium text-white mb-1">Event-Specific Terms</p>
              <p>• Cancellations made less than 48 hours before the event may be subject to a higher fee</p>
              <p>• Special events may have different cancellation policies</p>
            </div>
          </div>
          
          <div class="flex gap-3 justify-end mt-6">
            <button id="cancel-modal-btn" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">
              Cancel
            </button>
            <button id="proceed-btn" class="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm">
              Proceed to Cancel
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Add event listeners
      document.getElementById('cancel-modal-btn')?.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
      
      document.getElementById('proceed-btn')?.addEventListener('click', () => {
        document.body.removeChild(modal);
        
        Notiflix.Confirm.show(
          'Confirm Cancellation',
          `Are you sure you want to cancel this ticket? ₹${refundAmount.toFixed(2)} will be credited to your wallet.`,
          'Yes, Cancel Ticket',
          'No, Keep Ticket',
          () => {
            this.userProfileService.cancelTicket(bookingId).subscribe({
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
      });
    }
}
