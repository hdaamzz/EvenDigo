import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserNavComponent } from "../../../../shared/user-nav/user-nav.component";
import { PaymentService } from '../../../../core/services/user/payment/payment.service';
import { IBooking } from '../../../../core/models/booking.interface';

@Component({
  selector: 'app-payment-success',
  imports: [CommonModule, UserNavComponent],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css',
})
export class PaymentSuccessComponent{
  booking: IBooking | undefined;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private paymentService:PaymentService
  ) {}
  ngOnInit() {
    // Get session_id from query params
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    
    if (sessionId) {
      this.paymentService.getBooking(sessionId).subscribe(
        (bookingDetails) => {
          this.booking = bookingDetails.data;
        },
        (error) => {
          console.error("Error fetching booking details:", error);
          this.router.navigate(['/']);
        }
      );
    } else {
      this.router.navigate(['/']);
    }
  }





  downloadTickets() {
    this.isLoading = true;
    if (this.booking?.bookingId) {
      this.paymentService.downloadTickets(this.booking.bookingId).subscribe(
        (response) => {
          this.downloadFile(response, `Event_Tickets_${this.booking?.bookingId}.pdf`);
          this.isLoading = false;
        },
        (error) => {
          console.error("Error downloading tickets:", error);
          this.isLoading = false;
        }
      );
    }
  }


  downloadInvoice() {
    this.isLoading = true;
    if (this.booking?.bookingId) {
      this.paymentService.downloadInvoice(this.booking.bookingId).subscribe(
        (response) => {
          this.downloadFile(response, `Invoice_${this.booking?.bookingId}.pdf`);
          this.isLoading = false;
        },
        (error) => {
          console.error("Error downloading invoice:", error);
          this.isLoading = false;
        }
      );
    }
  }

  private downloadFile(data: Blob, fileName: string) {
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
