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

  // event distribution history

  getDistributedRevenue(page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('is_distributed', 'true');
      
    return this.http.get(`${this.baseUrl}admin/dist/recent`, { params , withCredentials: true});
  }
  
  getRevenueStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}admin/dist/stats`,{withCredentials:true});
  }
  getEventsByIds(eventIds: string[]): Observable<any[]> {
    const params = new HttpParams().set('ids', eventIds.join(','));
    return this.http.get<any[]>(`${this.baseUrl}admin/dist/batch`, { params , withCredentials: true});
  }
  getRevenueByDateRange(startDate: string, endDate: string, page: number = 1, limit: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('is_distributed', 'true');
      
    return this.http.get(`${this.baseUrl}admin/dist/date-range`, { params, withCredentials: true });
  }




  //refund history

  getRefundTransactions(page: number = 1, limit: number = 5): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get(`${this.baseUrl}admin/finance/refunds`, { params, withCredentials: true });
  }
  getRefundsByDateRange(startDate: string, endDate: string, page: number = 1, limit: number = 5, search: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (search) {
      params = params.set('search', search);
    }
    
    return this.http.get(`${this.baseUrl}admin/finance/refunds/range`, { params, withCredentials: true });
  }


// booking history

  fetchRevenue(page: number = 1, limit: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get(`${this.baseUrl}admin/finance/revenue`, { params, withCredentials: true });
  }
  
  fetchRevenueStats(): Observable<RevenueStats> {
    return this.http.get<RevenueStats>(`${this.baseUrl}admin/finance/stats`, { withCredentials: true });
  }
  
  getTransactionByDateRange(startDate: string, endDate: string): Observable<any> {    
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get(`${this.baseUrl}admin/finance/revenue/range`, { params, withCredentials: true });
  }
  
}
