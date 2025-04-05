// src/app/services/admin-coupon.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminCouponService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  // Fetch all coupons
  getCoupons(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}admin/coupon`, { withCredentials: true })
      .pipe(map((response: any) => response.data));
  }

  // Create a new coupon
  createCoupon(coupon: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}admin/coupon`, coupon, { withCredentials: true })
      .pipe(map((response: any) => response.data));
  }

  // Update an existing coupon
  updateCoupon(couponId: string, coupon: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}admin/coupon/${couponId}`, coupon, { withCredentials: true })
      .pipe(map((response: any) => response.data));
  }

  // Activate a coupon
  activateCoupon(couponId: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}admin/coupon/active/${couponId}`, {}, { withCredentials: true })
      .pipe(map((response: any) => response.data));
  }

  // Deactivate a coupon
  deactivateCoupon(couponId: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}admin/coupon/deactivate/${couponId}`, {}, { withCredentials: true })
      .pipe(map((response: any) => response.data));
  }

  // Delete a coupon
  deleteCoupon(couponId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}admin/coupon/${couponId}`, { withCredentials: true });
  }
}