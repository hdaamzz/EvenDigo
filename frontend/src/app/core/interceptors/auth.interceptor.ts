import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '../store/auth/auth.actions';

export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const store = inject(Store);

  const modifiedRequest = req.clone({
    withCredentials: true
  });

  return next(modifiedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthEndpoint(req.url)) {
        const errorBody = error.error;
        
        if (errorBody?.code === 'SESSION_EXPIRED' || 
            errorBody?.code === 'REFRESH_FAILED' || 
            errorBody?.code === 'NO_REFRESH_TOKEN') {
          
          store.dispatch(AuthActions.logout());
          
          const currentUrl = router.url;
          if (!currentUrl.includes('/login') && 
              !currentUrl.includes('/register') && 
              !currentUrl.includes('/reset-password') &&
              !currentUrl.includes('/admin/login')) {
            router.navigate(['/login'], { 
              queryParams: { returnUrl: currentUrl } 
            });
          }
        }
        
        return throwError(() => error);
      }

      return throwError(() => error);
    })
  );
};

function isAuthEndpoint(url: string): boolean {
  const authEndpoints = [
    '/auth/sign-in',
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