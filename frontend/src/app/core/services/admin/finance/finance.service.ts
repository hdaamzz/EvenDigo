import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Transaction {
  bookingId?: string;
  eventName: string;
  organizer: string;
  date: string;
  participant?: string;
  ticketDetails?: string;
  ticketType?: string;
  paymentType?: string;
  amount: string;
  status: string;
  statusClass?: string;
  rawData?: any;
}

export interface RevenueStats {
  totalRevenue: string;
  totalRevenueChange: number;
  todayRevenue: string;
  todayRevenueChange: number;
  monthlyRevenue: string;
  monthlyRevenueChange: number;
}

export interface BookingDetail {
  bookingId: string;
  eventName: string;
  eventId: string;
  organizer: string;
  participant: string;
  ticketDetails: Array<{
    type: string;
    price: number;
    quantity: number;
    usedTickets: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  discount: number;
  couponCode?: string;
  paymentStatus: string;
  paymentType: string;
  paymentDate: string;
  stripeSessionId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  baseUrl: string = environment.baseUrl;
  
  constructor(private http: HttpClient) { }

  fetchRevenue(page: number = 1, limit: number = 10, searchTerm: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (searchTerm) {
      params = params.set('search', searchTerm);
    }
    
    return this.http.get(`${this.baseUrl}/admin/finance/revenue`, { params, withCredentials: true });
  }
  
  fetchRevenueStats(): Observable<RevenueStats> {
    return this.http.get<RevenueStats>(`${this.baseUrl}/admin/finance/stats`, { withCredentials: true });
  }
  
  getRevenueByDateRange(startDate: string, endDate: string, paymentStatus?: string, paymentType?: string): Observable<any> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    if (paymentStatus) {
      params = params.set('status', paymentStatus);
    }
    
    if (paymentType) {
      params = params.set('paymentType', paymentType);
    }
    
    return this.http.get(`${this.baseUrl}/admin/finance/revenue/range`, { params, withCredentials: true });
  }
  
  getBookingDetails(bookingId: string): Observable<BookingDetail> {
    return this.http.get<BookingDetail>(`${this.baseUrl}/admin/finance/booking/${bookingId}`, { withCredentials: true });
  }
  
  getRevenueAnalytics(period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http.get(`${this.baseUrl}/admin/finance/analytics`, { params, withCredentials: true });
  }
}