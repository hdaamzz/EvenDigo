import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AllCouponResponse, CouponResponse, ICoupon } from '../../models/admin/coupon.interfacce';

@Injectable({
  providedIn: 'root'
})
export class AdminCouponService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  // Fetch all coupons
  getCoupons(): Observable<ICoupon[]> {
    return this.http.get<AllCouponResponse>(`${this.baseUrl}admin/coupon`, { withCredentials: true })
      .pipe(map((response) => response.data));
  }
  getCouponsWithPagination(page: number = 1, limit: number = 10): Observable<AllCouponResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    return this.http.get<AllCouponResponse>(`${this.baseUrl}admin/coupon`, { 
      params,
      withCredentials: true 
    });
  }
  

  // Create a new coupon
  createCoupon(coupon: ICoupon): Observable<ICoupon> {
    return this.http.post<CouponResponse>(`${this.baseUrl}admin/coupon`, coupon, { withCredentials: true })
      .pipe(map((response: CouponResponse) => response.data));
  }

  // Update an existing coupon
  updateCoupon(couponId: string, coupon: Partial<ICoupon>): Observable<ICoupon> {
    return this.http.put<CouponResponse>(`${this.baseUrl}admin/coupon/${couponId}`, coupon, { withCredentials: true })
      .pipe(map((response: CouponResponse) => response.data));
  }

  // Activate a coupon
  activateCoupon(couponId: string): Observable<ICoupon> {
    return this.http.patch<CouponResponse>(`${this.baseUrl}admin/coupon/active/${couponId}`, {}, { withCredentials: true })
      .pipe(map((response: CouponResponse) => response.data));
  }

  // Deactivate a coupon
  deactivateCoupon(couponId: string): Observable<ICoupon> {
    return this.http.patch<CouponResponse>(`${this.baseUrl}admin/coupon/deactivate/${couponId}`, {}, { withCredentials: true })
      .pipe(map((response: CouponResponse) => response.data));
  }

  // Delete a coupon
  deleteCoupon(couponId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}admin/coupon/${couponId}`, { withCredentials: true });
  }
}