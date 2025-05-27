import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../../services/user/auth/auth.service';


export const adminIsLogged: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.checkAuthStatus().pipe(
    map(response => {
      if (response.isAuthenticated && response?.user?.role === 'admin') {
        return true;
      } else {
        router.navigate(['/admin/login']);
        return false;
      }
    }),
    catchError(error => {
      router.navigate(['/admin/login']);
      return of(false);
    })
  );
};

export const adminIsLogout: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.checkAuthStatus().pipe(
    map(response => {
      if (response.isAuthenticated) {
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
      return of(true);
    })
  );
};