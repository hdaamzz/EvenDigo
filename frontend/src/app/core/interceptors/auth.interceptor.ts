import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, switchMap, throwError, of } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '../store/auth/auth.actions';
import { environment } from '../../environments/environment';

export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);
  const router = inject(Router);
  const store = inject(Store);

  const modifiedRequest = req.clone({
    withCredentials: true
  });

  return next(modifiedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthEndpoint(req.url)) {
        return http.post(`${environment.baseUrl}user/auth/refresh-token`, {}, { 
          withCredentials: true 
        }).pipe(
          switchMap((response: any) => {
            if (response.success) {
              return next(modifiedRequest);
            } else {
              store.dispatch(AuthActions.logout());
              router.navigate(['/login']);
              return throwError(() => error);
            }
          }),
          catchError((refreshError) => {
            store.dispatch(AuthActions.logout());
            
            const currentUrl = router.url;
            if (!currentUrl.includes('/login') && 
                !currentUrl.includes('/register') && 
                !currentUrl.includes('/reset-password') &&
                !currentUrl.includes('/admin/login')) {
              router.navigate(['/login']);
            }
            
            return throwError(() => error);
          })
        );
      }

      return throwError(() => error);
    })
  );
};

function isAuthEndpoint(url: string): boolean {
  const authEndpoints = [
    '/auth/sign-in',
    '/auth/refresh-token',
    '/auth/logout',
    '/auth/status',
    '/auth/send-otp',
    '/auth/verify-otp',
    '/auth/firebase-signin',
    '/auth/forgot-password',
    '/auth/reset-password'
  ];
  
  return authEndpoints.some(endpoint => url.includes(endpoint));
}