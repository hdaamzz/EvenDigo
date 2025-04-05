import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/user/auth.service';
import { catchError, map, of } from 'rxjs';

export const adminIsLogged: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  console.log('Checking protected route access...');

  return authService.checkAuthStatus().pipe(
    map(response => {
      console.log('Auth response in logged guard:', response);
      
      if (response.isAuthenticated) {
        
        if(response.role !== 'admin'){
          console.log('Access not  granted to protected route');
          router.navigate(['/']);
          return false
        }
        console.log('Access granted to protected route');
        return true;
      } else {
        console.log('No authentication, redirecting to login');
        router.navigate(['/']);
        return false;
      }
    }),
    catchError(error => {
      console.error('Auth check error:', error);
      if (error.status === 401) {
        router.navigate(['admin/login']);
      }
      return of(false);
    })
  );
};

export const adminIsLogout: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  console.log('Checking auth status in guard...');

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
      console.log('Auth check error:', error);
      // If 401 error (no/invalid token), allow access to login
      if (error.status === 401) {
        return of(true);
      }
      return of(true);
    })
  );
};
