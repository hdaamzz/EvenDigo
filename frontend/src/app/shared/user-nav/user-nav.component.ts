import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import { selectUser, selectIsAuthenticated } from '../../core/store/auth/auth.selectors';
import { AuthActions } from '../../core/store/auth/auth.actions';
import { AuthState, User } from '../../core/models/userModel';
import { GoogleAuthService } from '../../core/services/user/googleAuth/google-auth.service';
import { AppState } from '../../core/interfaces/user/profile';

@Component({
  selector: 'app-user-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-nav.component.html',
  styleUrl: './user-nav.component.css'
})
export class UserNavComponent implements OnInit, OnDestroy {
  user$: Observable<User | null>;
  isAuthenticated$: Observable<boolean>;
  
  isMobileMenuOpen = false;
  isDropdownOpen = false;
  isNavbarVisible = true;
  confirmLogoutOpen = false;
  private _lastScrollTop = 0;
  private readonly _scrollThreshold = 80;
  private readonly _scrollSensitivity = 10;
  
  private readonly _destroy$ = new Subject<void>();
  
  private readonly _avatarColors = [
    'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-red-600',
    'bg-yellow-600', 'bg-pink-600', 'bg-indigo-600', 'bg-teal-600',
    'bg-orange-800', 'bg-cyan-600', 'bg-lime-600', 'bg-emerald-600',
    'bg-rose-600', 'bg-amber-600', 'bg-fuchsia-600', 'bg-violet-600',
  ];

  constructor(
    private readonly _store: Store<AppState>,
    private readonly _router: Router,
    private readonly _googleAuthService: GoogleAuthService
  ) {
    this.user$ = this._store.select(selectUser);
    this.isAuthenticated$ = this._store.select(selectIsAuthenticated);
  }

  ngOnInit(): void {
    this.user$
      .pipe(takeUntil(this._destroy$))
      .subscribe();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }


  get userInitial$(): Observable<string> {
    return this.user$.pipe(
      map(user => user?.name?.charAt(0).toUpperCase() || 'U')
    );
  }


  getInitialColor(name: string): string {
    if (!name) return this._avatarColors[0];
    
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return this._avatarColors[sum % this._avatarColors.length];
  }


  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }


  logout(): void {
    this._store.dispatch(AuthActions.logout());
    this._googleAuthService.logout();
    this._resetMenuState();
  }

  navigateTo(path: string): void {
    this._router.navigate([path]);
    this.isMobileMenuOpen = false;
  }
  openConfirmLogout(): void {
    this.confirmLogoutOpen = true;
  }

  closeConfirmLogout(): void {
    this.confirmLogoutOpen = false;
  }

  confirmLogout(): void {
    this.logout(); 
    this.closeConfirmLogout();
  }


  @HostListener('window:scroll')
  onWindowScroll(): void {
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (currentScrollTop > this._lastScrollTop && currentScrollTop > this._scrollThreshold) {
      if (this.isNavbarVisible && currentScrollTop - this._lastScrollTop > this._scrollSensitivity) {
        this.isNavbarVisible = false;
      }
    } 
    else {
      if (!this.isNavbarVisible || currentScrollTop <= 20) {
        this.isNavbarVisible = true;
      }
    }
    
    this._lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
  }


  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = document.getElementById('userDropdown');
    
    if (dropdown && !dropdown.contains(target)) {
      this.isDropdownOpen = false;
    }
  }
  
  private _resetMenuState(): void {
    this.isMobileMenuOpen = false;
    this.isDropdownOpen = false;
  }
}