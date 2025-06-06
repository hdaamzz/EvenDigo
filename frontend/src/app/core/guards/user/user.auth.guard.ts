import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../../services/user/auth/auth.service';

export const isLogged: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.checkAuthStatus().pipe(
    map(response => {
      if (response.isAuthenticated && response?.user?.role === 'user') {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    }),
    catchError(error => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};

export const isLogout: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.checkAuthStatus().pipe(
    map(response => {
      if (response.isAuthenticated) {
        // Redirect based on role
        if (response?.user?.role === 'admin') {
          router.navigate(['/admin/dashboard']);
        } else {
          router.navigate(['/']);
        }
        return false;
      } else {
        return true;
      }
    }),
    catchError(error => {
      // If auth check fails, allow access to login/register pages
      return of(true);
    })
  );
};

export const isAdmin: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.checkAuthStatus().pipe(
    map(response => {
      if (response.isAuthenticated) {
        if (response?.user?.role === 'admin') {
          router.navigate(['/admin/dashboard']);
          return false;
        } else {
          return true; // User can access regular pages
        }
      } else {
        return true; // Allow anonymous access
      }
    }),
    catchError(error => {
      return of(true);
    })
  );
};