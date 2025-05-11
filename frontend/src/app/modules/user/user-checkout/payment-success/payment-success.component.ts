import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { UserNavComponent } from "../../../../shared/user-nav/user-nav.component";
import { PaymentService } from '../../../../core/services/user/payment/payment.service';
import { IBooking } from '../../../../core/models/booking.interface';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, UserNavComponent],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css',
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {
  booking: IBooking | undefined;
  isLoading = false;
  
  private readonly _destroy$ = new Subject<void>();
  
  constructor(
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _paymentService: PaymentService
  ) {}
  
  ngOnInit(): void {
    const sessionId = this._route.snapshot.queryParamMap.get('session_id');
    
    if (sessionId) {
      this._fetchBookingDetails(sessionId);
    } else {
      this._navigateToHome();
    }
  }
  
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
  
  downloadTickets(): void {
    if (!this.booking?.bookingId) return;
    
    this.isLoading = true;
    this._paymentService.downloadTickets(this.booking.bookingId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response) => {
          this._downloadFile(response, `Event_Tickets_${this.booking?.bookingId}.pdf`);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error downloading tickets:', error);
          this.isLoading = false;
        }
      });
  }
  
  downloadInvoice(): void {
    if (!this.booking?.bookingId) return;
    
    this.isLoading = true;
    this._paymentService.downloadInvoice(this.booking.bookingId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response) => {
          this._downloadFile(response, `Invoice_${this.booking?.bookingId}.pdf`);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error downloading invoice:', error);
          this.isLoading = false;
        }
      });
  }
  
  private _fetchBookingDetails(sessionId: string): void {
    this._paymentService.getBooking(sessionId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (bookingDetails) => {
          this.booking = bookingDetails.data;
        },
        error: (error) => {
          console.error('Error fetching booking details:', error);
          this._navigateToHome();
        }
      });
  }
  
  private _navigateToHome(): void {
    this._router.navigate(['/']);
  }
  
  private _downloadFile(data: Blob, fileName: string): void {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}