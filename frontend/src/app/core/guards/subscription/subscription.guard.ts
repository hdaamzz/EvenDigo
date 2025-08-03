import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { PremiumService } from '../../services/user/subscription/premium.service';
import { catchError, map, of } from 'rxjs';
import Notiflix from 'notiflix';

export const subscriptionGuard: CanActivateFn = (route, state) => {
  const subscriptionService = inject(PremiumService);

  return subscriptionService.getCurrentSubscription().pipe(
    map(response => {    
      return true;  
      if (response?.data?.isActive === true) {
        
      } else {
        Notiflix.Notify.info("For this feature you must have an active subscription :)");
        return false;
      }
    }),
    
    catchError(error => {
      Notiflix.Notify.failure('Unable to verify subscription status');
      return of(false);
    })
  );
};