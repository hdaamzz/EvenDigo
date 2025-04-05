import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Clone the request and set withCredentials to true
  const authReq = req.clone({
    withCredentials: true 
  });
  console.log(authReq);
  

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        console.log('Unauthorized request - redirecting to login');
        router.navigate(['/login']); // Redirect to login page
      } 
      return throwError(() => error); // Re-throw the error
    })
  );
};
