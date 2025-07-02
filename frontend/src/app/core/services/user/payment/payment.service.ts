import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import { BookingResponse } from '../../../models/booking.interface';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly apiUrl = `${environment.apiUrl}user/explore`;

  constructor(private http:HttpClient) { }

  getBooking(id:string):Observable<BookingResponse>{
        return this.http.get<BookingResponse>(`${this.apiUrl}/booking?id=${id}`);
  }
  downloadTickets(bookingId: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Accept': 'application/pdf',
    });
    
    return this.http.get(`${this.apiUrl}/bookings/${bookingId}/tickets`, {
      headers: headers,
      responseType: 'blob'
    });
  }

  downloadInvoice(bookingId: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Accept': 'application/pdf'
    });
    
    return this.http.get(`${this.apiUrl}/bookings/${bookingId}/invoice`, {
      headers: headers,
      responseType: 'blob'
    });
  }

}
