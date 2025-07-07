import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../core/store/auth/auth.selectors';
import { UserProfileService } from '../../../core/services/user/profile/user.profile.service';
import { AppState } from '../../../core/interfaces/user/profile';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  @ViewChild('sidebarRef') private _sidebarRef!: ElementRef;
  
  private readonly _destroy$ = new Subject<void>();
  public user$: Observable<any> | undefined;
  
  public userId: string | undefined;
  public isCollapsed = false;
  public isMenuActive = false;
  public window = window;
  
  public readonly navItems = [
    { icon: 'fa-user', label: 'Profile', path: '/profile/details', exact: true },
    { icon: 'fa-code-branch', label: 'My Events', path: '/profile/events' },
    { icon: 'fa-ticket-alt', label: 'My Bookings', path: '/profile/bookings' },
    { icon: 'fa-credit-card', label: 'Subscription', path: '/profile/subscription' },
    { icon: 'fa-wallet', label: 'Wallet', path: '/profile/wallet' }
  ];

  public readonly secondaryNavItems = [
    { icon: 'fa-home', label: 'Home', path: '/' },
    // { icon: 'fa-sign-out-alt', label: 'Logout', path: '/logout' }
  ];

  constructor(
    private readonly _router: Router,
    private readonly _store: Store<AppState>,
  ) {}

  public ngOnInit(): void {
    this._checkScreenSize();
    this._initUserData();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  @HostListener('window:resize')
  public onResize(): void {
    this._checkScreenSize();
  }

  @HostListener('document:keydown.escape')
  public onEscapePress(): void {
    if (this.isMenuActive) {
      this.isMenuActive = false;
    }
  }

  public toggleSidebar(): void {
    if (window.innerWidth >= 1024) {
      this.isCollapsed = !this.isCollapsed;
    }
  }

  public toggleMenu(): void {
    if (window.innerWidth < 1024) {
      this.isMenuActive = !this.isMenuActive;
      
      if (this.isMenuActive) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    }
  }

  public onNavItemClick(): void {
    if (window.innerWidth < 1024 && this.isMenuActive) {
      this.isMenuActive = false;
      document.body.style.overflow = 'auto';
    }
  }
  
  public isActive(path: string): boolean {
    return this._router.isActive(path, path === '/profile');
  }
  
  private _checkScreenSize(): void {
    if (window.innerWidth >= 1024) {
      this.isMenuActive = false;
      document.body.style.overflow = 'auto';
    } else {
      this.isCollapsed = false;
    }
  }
  
  private _initUserData(): void {
    this.user$ = this._store.select(selectUser);
    
    this.user$
      .pipe(takeUntil(this._destroy$))
      .subscribe(user => {
        if (user) {
          this.userId = user.id;
        }
      });
  }
}