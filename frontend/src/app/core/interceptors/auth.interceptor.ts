import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '../store/auth/auth.actions';

export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const store = inject(Store);

  // Always include credentials (cookies) with requests
  const modifiedRequest = req.clone({
    withCredentials: true
  });

  return next(modifiedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 errors for protected routes
      if (error.status === 401 && !isAuthEndpoint(req.url)) {
        const errorBody = error.error;
        
        // Check the error code to determine the appropriate action
        if (errorBody?.code === 'SESSION_EXPIRED' || 
            errorBody?.code === 'REFRESH_FAILED' || 
            errorBody?.code === 'NO_REFRESH_TOKEN') {
          
          // Session is completely expired, redirect to login
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
        
        // For other 401 errors, let the component handle them
        return throwError(() => error);
      }

      // For non-401 errors or auth endpoints, pass through
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