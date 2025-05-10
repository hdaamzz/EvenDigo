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

  /**
   * Fetch all coupons without pagination
   * @returns Observable of coupon list
   */
  getCoupons(): Observable<ICoupon[]> {
    return this.http.get<AllCouponResponse>(this.baseUrl, { withCredentials: true })
      .pipe(
        map((response) => response.data)
      );
  }

  /**
   * Fetch coupons with pagination
   * @param page Page number (starting from 1)
   * @param limit Number of items per page
   * @returns Observable with paginated coupon response
   */
  getCouponsWithPagination(page: number = 1, limit: number = 10): Observable<AllCouponResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    return this.http.get<AllCouponResponse>(this.baseUrl, { 
      params,
      withCredentials: true 
    });
  }

  /**
   * Create a new coupon
   * @param coupon Coupon data
   * @returns Observable of created coupon
   */
  createCoupon(coupon: ICoupon): Observable<ICoupon> {
    return this.http.post<CouponResponse>(this.baseUrl, coupon, { withCredentials: true })
      .pipe(
        map((response: CouponResponse) => response.data)
      );
  }

  /**
   * Update an existing coupon
   * @param couponId ID of the coupon to update
   * @param coupon Updated coupon data
   * @returns Observable of updated coupon
   */
  updateCoupon(couponId: string, coupon: Partial<ICoupon>): Observable<ICoupon> {
    return this.http.put<CouponResponse>(`${this.baseUrl}/${couponId}`, coupon, { withCredentials: true })
      .pipe(
        map((response: CouponResponse) => response.data)
      );
  }

  /**
   * Activate a coupon
   * @param couponId ID of the coupon to activate
   * @returns Observable of activated coupon
   */
  activateCoupon(couponId: string): Observable<ICoupon> {
    return this.http.patch<CouponResponse>(`${this.baseUrl}/active/${couponId}`, {}, { withCredentials: true })
      .pipe(
        map((response: CouponResponse) => response.data)
      );
  }

  /**
   * Deactivate a coupon
   * @param couponId ID of the coupon to deactivate
   * @returns Observable of deactivated coupon
   */
  deactivateCoupon(couponId: string): Observable<ICoupon> {
    return this.http.patch<CouponResponse>(`${this.baseUrl}/deactivate/${couponId}`, {}, { withCredentials: true })
      .pipe(
        map((response: CouponResponse) => response.data)
      );
  }

  /**
   * Delete a coupon
   * @param couponId ID of the coupon to delete
   * @returns Observable of void
   */
  deleteCoupon(couponId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${couponId}`, { withCredentials: true });
  }
}