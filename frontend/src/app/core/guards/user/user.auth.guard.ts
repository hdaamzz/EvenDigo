import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/user/auth.service';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

export const isLogged: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  // console.log('Checking protected route access...');

  return authService.checkAuthStatus().pipe(
    map(response => {
      
      if (response.isAuthenticated && response.role=='user') {
        
        console.log('Access granted to protected route');
        return true;
      } else {
        console.log('No authentication, redirecting to login');
        router.navigate(['/login']);
        return false;
      }
    }),
    catchError(error => {
      // console.error('Auth check error:', error);
      if (error.status === 401) {
        router.navigate(['/login']);
      }
      return of(false);
    })
  );
};

export const isLogout: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  // console.log('Checking auth status in guard...');

  return authService.checkAuthStatus().pipe(
    map(response => {
      console.log('Auth response in logout guard:', response);
      
      if (response.isAuthenticated) {
        
        console.log('User is authenticated, redirecting to home');
        router.navigate(['/']);
        return false;
      } else {
        console.log('No authentication, allowing access to login');
        return true;
      }
    }),
    catchError(error => {
      // console.log('Auth check error:', error);
      // If 401 error (no/invalid token), allow access to login
      if (error.status === 401) {
        return of(true);
      }
      return of(true);
    })
  );
};


export const isAdmin: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  // console.log('Checking auth status in guard...');

  return authService.checkAuthStatus().pipe(
    map(response => {
      // console.log('Auth response in logout guard:', response);
      
      if (response.isAuthenticated) {
        if(response.role !=='user'){
          router.navigate(['admin/dashboard']);
          return false;
        }else{
          console.log('No authentication, allowing access to login');
        return true;
        }
      } else {
        console.log('No authentication, allowing access to login');
        return true;
      }
    }),
    catchError(error => {
      // console.log('Auth check error:', error);
      // If 401 error (no/invalid token), allow access to login
      if (error.status === 401) {
        return of(true);
      }
      return of(true);
    })
  );
};