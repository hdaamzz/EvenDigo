// auth.interceptor.ts (functional version)
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthActions } from '../store/auth/auth.actions';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   const store = inject(Store);
  
//   return next(req).pipe(
//     catchError((error: HttpErrorResponse) => {
//       if (error.status === 401) {
//         store.dispatch(AuthActions.loginFailure({ 
//           error: 'Session expired or unauthorized' 
//         }));
//       }
//       return throwError(() => error);
//     })
//   );
// };