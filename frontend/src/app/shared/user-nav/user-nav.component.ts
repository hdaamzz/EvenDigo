import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { selectUser, selectIsAuthenticated } from '../../core/store/auth/auth.selectors';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { AuthState, User } from '../../core/models/userModel';
import { AuthActions } from '../../core/store/auth/auth.actions';
import { Router } from '@angular/router';
import { GoogleAuthService } from '../../core/services/user/googleAuth/google-auth.service';
interface AppState {
  auth: AuthState;
}


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
  private destroy$ = new Subject<void>();
  
  constructor(
    private store: Store<AppState>,
    private router: Router,
    private googleAuthService: GoogleAuthService

  ) {
    this.user$ = this.store.select(selectUser);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
  }

  ngOnInit(): void {
    this.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => console.log('User state updated:', user),
        error: (error) => console.error('Error in user$ subscription:', error)
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  getInitialColor(name: string): string {
    const colors = [
      'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-red-600',
      'bg-yellow-600', 'bg-pink-600', 'bg-indigo-600', 'bg-teal-600',
      'bg-orange-800', 'bg-cyan-600', 'bg-lime-600', 'bg-emerald-600',
      'bg-rose-600', 'bg-amber-600', 'bg-fuchsia-600', 'bg-violet-600',
    ];
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
    
    
    this.googleAuthService.logout();
    
    this.isMobileMenuOpen = false;
    this.isDropdownOpen = false;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.isMobileMenuOpen = false;
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = document.getElementById('userDropdown');
    if (dropdown && !dropdown.contains(target)) {
      this.isDropdownOpen = false;
    }
  }

  get userInitial(): Observable<string> {
    return this.user$.pipe(
      map(user => user?.name?.charAt(0).toUpperCase() || 'U')
    );
  }
}