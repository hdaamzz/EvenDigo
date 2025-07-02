import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AllCouponResponse, CouponResponse, ICoupon } from '../../../models/admin/coupon.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminCouponService {
  private readonly apiUrl = `${environment.apiUrl}admin/coupon`;

  constructor(private http: HttpClient) { }

  getCoupons(): Observable<ICoupon[]> {
    return this.http.get<AllCouponResponse>(this.apiUrl,)
      .pipe(
        map((response) => response.data)
      );
  }
  getCouponsWithPaginationAndSearch(page: number = 1, limit: number = 10, searchTerm: string = ''): Observable<AllCouponResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (searchTerm.trim()) {
      params = params.set('search', searchTerm.trim());
    }

    return this.http.get<AllCouponResponse>(this.apiUrl, {
      params,
      withCredentials: true
    });
  }
  getCouponsWithPagination(page: number = 1, limit: number = 10): Observable<AllCouponResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<AllCouponResponse>(this.apiUrl, {
      params,
      withCredentials: true
    });
  }
  createCoupon(coupon: ICoupon): Observable<ICoupon> {
    return this.http.post<CouponResponse>(this.apiUrl, coupon,)
      .pipe(
        map((response: CouponResponse) => response.data)
      );
  }
  updateCoupon(couponId: string, coupon: Partial<ICoupon>): Observable<ICoupon> {
    return this.http.put<CouponResponse>(`${this.apiUrl}/${couponId}`, coupon,)
      .pipe(
        map((response: CouponResponse) => response.data)
      );
  }
  activateCoupon(couponId: string): Observable<ICoupon> {
    return this.http.patch<CouponResponse>(`${this.apiUrl}/active/${couponId}`, {},)
      .pipe(
        map((response: CouponResponse) => response.data)
      );
  }
  deactivateCoupon(couponId: string): Observable<ICoupon> {
    return this.http.patch<CouponResponse>(`${this.apiUrl}/deactivate/${couponId}`, {},)
      .pipe(
        map((response: CouponResponse) => response.data)
      );
  }
  deleteCoupon(couponId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${couponId}`,);
  }
}