import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import Notiflix from 'notiflix';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authReducer } from './core/store/auth/auth.reducer';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { AuthEffects } from './core/store/auth/auth.effects';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from './environments/environment';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { tokenRefreshInterceptor } from './core/interceptors/auth.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
  provideRouter(routes), provideAnimationsAsync(), 
  providePrimeNG({ theme: { preset: Aura } }),
  provideHttpClient(withInterceptors([tokenRefreshInterceptor])),
  provideStore({ router: routerReducer, auth: authReducer }), 
  provideEffects([AuthEffects]), provideRouterStore(), 
  provideFirebaseApp(() => initializeApp(environment.firebase)), 
  provideAuth(() => getAuth()),
  ]
};

Notiflix.Notify.init({
  position: 'right-bottom',
  distance: '10px',
  opacity: 1,
  borderRadius: '8px',
  timeout: 3000,
  messageMaxLength: 110,
  backOverlay: false,
  cssAnimation: true,
  cssAnimationDuration: 300,
  cssAnimationStyle: 'fade',
  plainText: true,
  showOnlyTheLastOne: false,
  clickToClose: false,
  pauseOnHover: true,
  zindex: 4001,
  fontFamily: 'Quicksand',
  fontSize: '12px',

  success: {
    background: '#00ff66',
    textColor: '#ffffff',
    childClassName: 'success-notification',
    notiflixIconColor: 'rgba(255,255,255,0.84)',
    fontAwesomeClassName: 'fas fa-check-circle',
  },

  failure: {
    background: '#ff5549',
    textColor: '#fff',
    childClassName: 'failure-notification',
    notiflixIconColor: 'rgba(255,255,255,0.84)',
    fontAwesomeClassName: 'fas fa-times-circle',
  },

  warning: {
    background: '#eebf31',
    textColor: '#fff',
    childClassName: 'warning-notification',
    notiflixIconColor: 'rgba(255,255,255,0.84)',
    fontAwesomeClassName: 'fas fa-exclamation-circle',
  },

  info: {
    background: '#26c0d3',
    textColor: '#fff',
    childClassName: 'info-notification',
    notiflixIconColor: 'rgba(255,255,255,0.84)',
    fontAwesomeClassName: 'fas fa-info-circle',
  }
});