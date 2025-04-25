import { Component, HostListener, OnInit } from '@angular/core';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { UsersListComponent } from "./users-list/users-list.component";
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../core/store/auth/auth.actions';
import Notiflix from 'notiflix';
import { EventsListComponent } from "./events-list/events-list.component";
import { CouponListComponent } from './coupon-list/coupon-list.component';
import { AchievementsComponent } from "./achievements/achievements.component";

@Component({
  selector: 'app-dashboard',
  imports: [DashboardHomeComponent, UsersListComponent, CommonModule, EventsListComponent, CouponListComponent, AchievementsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  activeView: 'dashboard' | 'users' | 'events' | 'coupons' | 'achievements' = 'dashboard';
  sidebarOpen: boolean = false;
  
  get dashBoard(): boolean { return this.activeView === 'dashboard'; }
  get userList(): boolean { return this.activeView === 'users'; }
  get eventList(): boolean { return this.activeView === 'events'; }
  get couponList(): boolean { return this.activeView === 'coupons'; }
  get achievements(): boolean { return this.activeView === 'achievements'; }

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.navigateTo('dashboard');
    this.sidebarOpen = window.innerWidth >= 1024;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebarOnMobile(): void {
    if (window.innerWidth < 1024) {
      this.sidebarOpen = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.sidebarOpen = event.target.innerWidth >= 1024;
  }

  navigateTo(view: 'dashboard' | 'users' | 'events' | 'coupons' | 'achievements'): void {
    this.activeView = view;
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

  logout(): void {
    this.store.dispatch(AuthActions.logout());
    Notiflix.Notify.success('Admin Logout Successfully');
  }
}