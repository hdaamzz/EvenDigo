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

/**
 * Application state interface for strong typing
 */
interface AppState {
  auth: AuthState;
}

/**
 * Navigation component for user-facing pages with authentication features
 */
@Component({
  selector: 'app-user-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-nav.component.html',
  styleUrl: './user-nav.component.css'
})
export class UserNavComponent implements OnInit, OnDestroy {
  // Auth state observables
  user$: Observable<User | null>;
  isAuthenticated$: Observable<boolean>;
  
  // UI state
  isMobileMenuOpen = false;
  isDropdownOpen = false;
  isNavbarVisible = true;
  
  // Scroll tracking
  private _lastScrollTop = 0;
  private readonly _scrollThreshold = 80;
  private readonly _scrollSensitivity = 10;
  
  // Cleanup subject
  private readonly _destroy$ = new Subject<void>();
  
  // Pre-defined avatar colors for user initials
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
    // Keep subscription open for user state changes
    this.user$
      .pipe(takeUntil(this._destroy$))
      .subscribe();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Derived observable for user's initial letter
   */
  get userInitial$(): Observable<string> {
    return this.user$.pipe(
      map(user => user?.name?.charAt(0).toUpperCase() || 'U')
    );
  }

  /**
   * Determine avatar background color based on user name
   * @param name - User's name
   */
  getInitialColor(name: string): string {
    if (!name) return this._avatarColors[0];
    
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return this._avatarColors[sum % this._avatarColors.length];
  }

  /**
   * Toggle mobile menu visibility
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  /**
   * Toggle user dropdown menu
   * @param event - Click event
   */
  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /**
   * Log out current user and clear state
   */
  logout(): void {
    this._store.dispatch(AuthActions.logout());
    this._googleAuthService.logout();
    this._resetMenuState();
  }

  /**
   * Navigate to specified route and close mobile menu
   * @param path - Route path
   */
  navigateTo(path: string): void {
    this._router.navigate([path]);
    this.isMobileMenuOpen = false;
  }

  /**
   * Handle scroll events to show/hide navbar
   */
  @HostListener('window:scroll')
  onWindowScroll(): void {
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Scrolling down past threshold
    if (currentScrollTop > this._lastScrollTop && currentScrollTop > this._scrollThreshold) {
      if (this.isNavbarVisible && currentScrollTop - this._lastScrollTop > this._scrollSensitivity) {
        this.isNavbarVisible = false;
      }
    } 
    // Scrolling up or at top
    else {
      if (!this.isNavbarVisible || currentScrollTop <= 20) {
        this.isNavbarVisible = true;
      }
    }
    
    this._lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
  }

  /**
   * Close dropdown when clicking outside
   * @param event - Click event
   */
  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = document.getElementById('userDropdown');
    
    if (dropdown && !dropdown.contains(target)) {
      this.isDropdownOpen = false;
    }
  }
  
  /**
   * Reset menu state when logging out or navigating
   * @private
   */
  private _resetMenuState(): void {
    this.isMobileMenuOpen = false;
    this.isDropdownOpen = false;
  }
}