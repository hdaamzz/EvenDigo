import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { isLogged, isLogout } from './user.auth.guard';
import { AuthService } from '../../services/user/auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('User Auth Guards', () => {
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;
  
  // Define guard executors
  const executeLoggedGuard: CanActivateFn = (...guardParameters) => 
    TestBed.runInInjectionContext(() => isLogged(...guardParameters));
  
  const executeLogoutGuard: CanActivateFn = (...guardParameters) => 
    TestBed.runInInjectionContext(() => isLogout(...guardParameters));
  
  // Mock route and state
  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = {} as RouterStateSnapshot;

  beforeEach(() => {
    // Create spies for dependencies
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['checkAuthStatus']);
    
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
    
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });
});