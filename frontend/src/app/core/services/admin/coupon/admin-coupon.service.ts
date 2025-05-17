import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AllCouponResponse, CouponResponse, ICoupon } from '../../../models/admin/coupon.interface';

/**
 * Service for managing coupon operations in the admin panel
 */
@Injectable({
  providedIn: 'root'
})
export class AdminCouponService {
  private readonly baseUrl = `${environment.baseUrl}admin/coupon`;

  constructor(private http: HttpClient) {}


  getCoupons(): Observable<ICoupon[]> {
    return this.http.get<AllCouponResponse>(this.baseUrl, )
      .pipe(
        map((response) => response.data)
      );
  }


  getCouponsWithPagination(page: number = 1, limit: number = 10): Observable<AllCouponResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    return this.http.get<AllCouponResponse>(this.baseUrl, { 
      params,
      withCredentials: true 
    });
  }

  createCoupon(coupon: ICoupon): Observable<ICoupon> {
    return this.http.post<CouponResponse>(this.baseUrl, coupon, )
      .pipe(
        map((response: CouponResponse) => response.data)
      );
  }


  updateCoupon(couponId: string, coupon: Partial<ICoupon>): Observable<ICoupon> {
    return this.http.put<CouponResponse>(`${this.baseUrl}/${couponId}`, coupon, )
      .pipe(
        map((response: CouponResponse) => response.data)
      );
  }


  activateCoupon(couponId: string): Observable<ICoupon> {
    return this.http.patch<CouponResponse>(`${this.baseUrl}/active/${couponId}`, {}, )
      .pipe(
        map((response: CouponResponse) => response.data)
      );
  }


  deactivateCoupon(couponId: string): Observable<ICoupon> {
    return this.http.patch<CouponResponse>(`${this.baseUrl}/deactivate/${couponId}`, {}, )
      .pipe(
        map((response: CouponResponse) => response.data)
      );
  }


  deleteCoupon(couponId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${couponId}`, );
  }
}