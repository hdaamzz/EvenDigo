import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import Notiflix from 'notiflix';
import { AuthActions } from '../../../core/store/auth/auth.actions';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { UsersListComponent } from './users-list/users-list.component';
import { EventsListComponent } from './events-list/events-list.component';
import { CouponListComponent } from './coupon-list/coupon-list.component';
import { AchievementsComponent } from './achievements/achievements.component';
import { FinanceRevenueComponent } from './finance-revenue/finance-revenue.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { FinanceRefundComponent } from './finance-refund/finance-refund.component';
import { FinanceBookingComponent } from './finance-booking/finance-booking.component';
import { SubscriptionPlansComponent } from './subscription-plans/subscription-plans.component';
import { FinanceSectionType, SubscriptionSectionType, ViewType } from '../../../core/interfaces/admin/dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DashboardHomeComponent,
    UsersListComponent,
    EventsListComponent,
    CouponListComponent,
    AchievementsComponent,
    FinanceRevenueComponent,
    SubscriptionComponent,
    FinanceRefundComponent,
    FinanceBookingComponent,
    SubscriptionPlansComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  financeDropdownOpen = false;
  subscriptionDropdownOpen = false;
  financeSection: FinanceSectionType = null;
  subscriptionSection: SubscriptionSectionType = null;
  activeView: ViewType = 'dashboard';
  sidebarOpen = false;
  confirmLogoutOpen = false;

  
  get dashBoard(): boolean { return this.activeView === 'dashboard'; }
  get userList(): boolean { return this.activeView === 'users'; }
  get eventList(): boolean { return this.activeView === 'events'; }
  get couponList(): boolean { return this.activeView === 'coupons'; }
  get achievements(): boolean { return this.activeView === 'achievements'; }
  get finance(): boolean { return this.activeView === 'finance'; }
  get subscription(): boolean { return this.activeView === 'subscription'; }

  constructor(private _store: Store) {}

  ngOnInit(): void {
    this.navigateTo('dashboard');
    this._setSidebarStateBasedOnScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent): void {
    if (event.target instanceof Window) {
      this.sidebarOpen = event.target.innerWidth >= 1024;
    }
  }

  navigateTo(view: ViewType): void {
    this.activeView = view;
    this.closeSidebarOnMobile();
  }

  showDashboard(): void {
    this.navigateTo('dashboard');
  }

  showUserList(): void {
    this.navigateTo('users');
  }

  showEventsList(): void {
    this.navigateTo('events');
  }

  showCouponList(): void {
    this.navigateTo('coupons');
  }

  showAchievements(): void {
    this.navigateTo('achievements');
  }
  
  showSubscriptionList(): void {
    this.navigateTo('subscription');
    if (!this.subscriptionSection) {
      this.subscriptionSection = 'management';
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebarOnMobile(): void {
    if (window.innerWidth < 1024) {
      this.sidebarOpen = false;
    }
  }

  toggleFinanceDropdown(): void {
    this.financeDropdownOpen = !this.financeDropdownOpen;
    if (this.financeDropdownOpen) {
      this.subscriptionDropdownOpen = false;
    }
  }
  
  toggleSubscriptionDropdown(): void {
    this.subscriptionDropdownOpen = !this.subscriptionDropdownOpen;
    if (this.subscriptionDropdownOpen) {
      this.financeDropdownOpen = false;
    }
  }

  navigateToFinanceSection(section: 'revenue' | 'refunds' | 'bookings'): void {
    this.navigateTo('finance');
    this.financeSection = section;
  }

  navigateToSubscriptionSection(section: 'management' | 'plans'): void {
    this.navigateTo('subscription');
    this.subscriptionSection = section;
  }

  logout(): void {
    this._store.dispatch(AuthActions.logout());
    Notiflix.Notify.success('Admin Logout Successfully');
  }
  openConfirmLogout(): void {
    this.confirmLogoutOpen = true;
  }

  closeConfirmLogout(): void {
    this.confirmLogoutOpen = false;
  }

  confirmLogout(): void {
    this.closeConfirmLogout();
    this.logout();
  }

  
  private _setSidebarStateBasedOnScreenSize(): void {
    this.sidebarOpen = window.innerWidth >= 1024;
  }
}