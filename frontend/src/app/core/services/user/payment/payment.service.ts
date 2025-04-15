import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { BookingResponse } from '../../../models/booking.interface';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl=environment.baseUrl
  constructor(private http:HttpClient) { }

  getBooking(id:string):Observable<BookingResponse>{
        return this.http.get<BookingResponse>(`${this.baseUrl}user/explore/booking?id=${id}`,{withCredentials: true});
  }
  downloadTickets(bookingId: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Accept': 'application/pdf',
    });
    
    return this.http.get(`${this.baseUrl}user/explore/bookings/${bookingId}/tickets`, {
      headers: headers,
      responseType: 'blob',
      withCredentials: true
    });
  }

  downloadInvoice(bookingId: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Accept': 'application/pdf'
    });
    
    return this.http.get(`${this.baseUrl}user/explore/bookings/${bookingId}/invoice`, {
      headers: headers,
      responseType: 'blob',
      withCredentials: true
    });
  }

}
