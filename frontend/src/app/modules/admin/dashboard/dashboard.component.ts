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
  dashBoard: boolean = false;
  userList: boolean = false;
  eventList: boolean = false;
  couponList:boolean =false;
  sidebarOpen: boolean = false;
  achievements:boolean = false;


  constructor(private store: Store) { }

  ngOnInit(): void {
    this.showDashboard();
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
    if (event.target.innerWidth >= 1024) {
      this.sidebarOpen = true;
    } else {
      this.sidebarOpen = false;
    }
  }
  showDashboard(): void {
    if (!this.dashBoard) {
      this.eventList=false
      this.userList = false;
      this.couponList = false;
      this.dashBoard = true;
    }
  }

  showAchievements(): void {
    if (!this.achievements) {
      this.eventList=false
      this.userList = false;
      this.couponList = false;
      this.dashBoard = false;
      this.achievements=true;
    }
  }

  showUserList(): void {
    if (!this.userList) {
      this.dashBoard = false;
      this.userList = true;
      this.eventList=false;
      this.couponList = false;
      this.achievements=false;
    }
  }

  showEventsList(): void {
    if (!this.eventList) {
      this.dashBoard = false;
      this.userList = false;
      this.eventList=true;
      this.couponList=false;
      this.achievements=false;
    }
  }
  showCouponList(): void {
    if (!this.couponList) {
      this.couponList=true;
      this.dashBoard = false;
      this.userList = false;
      this.eventList=false;
      this.achievements=false;

    }
  }
  logout(): void {
    this.store.dispatch(AuthActions.logout());
    Notiflix.Notify.success('Admin Logout Successfully')
  }

}
