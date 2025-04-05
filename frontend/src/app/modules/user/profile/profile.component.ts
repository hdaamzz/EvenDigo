import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AuthState, User } from '../../../core/models/userModel';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../core/store/auth/auth.selectors';
import { UserProfileService } from '../../../core/services/user/user.profile.service';
interface AppState {
  auth: AuthState;
}
@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})

export class ProfileComponent implements OnInit, OnDestroy{
  @ViewChild('sidebarRef') sidebarRef!: ElementRef;
  user$: Observable<any | null>;
  private destroy$ = new Subject<void>();
  userId:string | undefined;
  isCollapsed = false;
  isMenuActive = false;

  
  navItems = [
    { icon: 'fa-user', label: 'Profile', path: '/profile/details', exact: true },
    { icon: 'fa-code-branch', label: 'My events', path: '/profile/events' },
    { icon: 'fa-wallet', label: 'Wallet', path: '/profile/wallet' }
  ];

  secondaryNavItems = [
    { icon: 'fa-home', label: 'Home', path: '/' },
    { icon: 'fa-sign-out-alt', label: 'Logout', path: '/logout' }
  ];

  constructor(
    private router: Router,
    private store: Store<AppState>,
    private userProfileService: UserProfileService
  ) {
      this.user$ = this.store.select(selectUser);
     
      
  }

  ngOnInit(): void {
    this.checkScreenSize();
    this.user$
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (user) =>{              
              this.userId=user?._id ;
              
              this.userProfileService.updateUserId(this.userId);           
            },
            error: (error) => console.error('Error in user$ subscription:', error)
          });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    if (window.innerWidth >= 1024) {
      this.isMenuActive = false;
    } else {
      this.isCollapsed = false;
    }
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleMenu(): void {
    this.isMenuActive = !this.isMenuActive;
  }
  

  // isActive(path: string): boolean {
  //   return this.router.isActive(path, path === '/profile' ? true : false);
  // }
}
