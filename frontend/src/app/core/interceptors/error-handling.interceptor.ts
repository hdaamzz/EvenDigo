import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

export const errorHandlingInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';
      let shouldShowError = true;
      let shouldLogError = true;

      if (isAuthEndpoint(req.url)) {
        return throwError(() => error);
      }

      switch (error.status) {
        case 0:
          errorMessage = 'Network error. Please check your connection.';
          break;
        
        case 400:
          errorMessage = getErrorMessage(error) || 'Invalid request. Please check your input.';
          break;
        
        case 401:
          errorMessage = 'Your session has expired. Please log in again.';
          shouldShowError = false;
          shouldLogError = false; 
          break;
        
        case 403:
          errorMessage = 'You don\'t have permission to perform this action.';
          break;
        
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        
        case 409:
          errorMessage = getErrorMessage(error) || 'A conflict occurred. The resource may already exist.';
          break;
        
        case 422:
          errorMessage = getErrorMessage(error) || 'Validation failed. Please check your input.';
          break;
        
        case 429:
          errorMessage = 'Too many requests. Please try again later.';
          break;
        
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        
        case 502:
          errorMessage = 'Server is temporarily unavailable. Please try again later.';
          break;
        
        case 503:
          errorMessage = 'Service is temporarily unavailable. Please try again later.';
          break;
        
        case 504:
          errorMessage = 'Request timed out. Please try again.';
          break;
        
        default:
          if (error.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (error.status >= 400) {
            errorMessage = getErrorMessage(error) || 'Client error. Please check your request.';
          }
      }

      if (shouldLogError) {
        console.error('HTTP Error:', {
          status: error.status,
          message: errorMessage,
          url: req.url,
          method: req.method,
          error: error
        });
      }

      if (shouldShowError) {
        Notify.failure(errorMessage);
      }

      return throwError(() => error);
    })
  );
};

function getErrorMessage(error: HttpErrorResponse): string | null {
  if (error.error) {
    if (typeof error.error === 'string') {
      return error.error;
    }
    
    if (error.error.message) {
      return error.error.message;
    }
    
    if (error.error.error && typeof error.error.error === 'string') {
      return error.error.error;
    }
    
    if (error.error.error?.message) {
      return error.error.error.message;
    }
    
    if (error.error.errors && Array.isArray(error.error.errors)) {
      return error.error.errors.map((err: any) => err.message || err).join(', ');
    }
    
    if (error.error.details) {
      return error.error.details;
    }
  }
  
  return null;
}

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