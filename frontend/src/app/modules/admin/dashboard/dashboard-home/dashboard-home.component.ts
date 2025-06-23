import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChartConfiguration } from 'chart.js';
import {
  StatCard,
  ChartData,
  Transaction,
  Subscription,
  Activity,
  UpcomingEvent,
  ApiResponse,
  NewCounts,
} from '../../../../core/interfaces/admin/dashboard';
import { DashboardService } from '../../../../core/services/admin/dashboard/dashboard.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, CardModule, ChartModule, ButtonModule, ProgressBarModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css'],
})
export class DashboardHomeComponent implements OnInit {
  statCards: StatCard[] = [];
  revenueData: ChartData | null = null;
  userRegistrationData: ChartData | null = null;
  transactions: Transaction[] = [];
  subscriptions: Subscription[] = [];
  activities: Activity[] = [];
  upcomingEvents: UpcomingEvent[] = [];
  newCounts: NewCounts = { newSubscriptions: 0, newActivities: 0 };
  loading = {
    stats: false,
    revenue: false,
    userRegistrations: false,
    transactions: false,
    subscriptions: false,
    activities: false,
    upcomingEvents: false,
    newCounts: false,
  };
  errors: { [key: string]: string } = {};
  selectedPeriod: string = 'monthly';

  revenueChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } },
  };
  userRegistrationChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } },
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loadStatCards();
    this.loadRevenueData();
    this.loadUserRegistrationData();
    this.loadTransactions();
    this.loadSubscriptions();
    this.loadActivities();
  }

  loadStatCards(): void {
    this.loading.stats = true;
    this.errors['stats'] = '';
    this.dashboardService.getStatCards().subscribe({
      next: (response: ApiResponse<StatCard[]>) => {
        if (response.success) {
          this.statCards = response.data;
        } else {
          this.errors['stats'] = response.message || 'Failed to load stats';
        }
        this.loading.stats = false;
      },
      error: (error: ApiResponse<any>) => {
        this.errors['stats'] = error.message || 'Error loading stats';
        this.loading.stats = false;
      },
    });
  }

  loadRevenueData(period: string = this.selectedPeriod): void {
    this.loading.revenue = true;
    this.errors['revenue'] = '';
    this.dashboardService.getRevenueData(period).subscribe({
      next: (response: ApiResponse<ChartData>) => {
        if (response.success) {
          this.revenueData = response.data;
        } else {
          this.errors['revenue'] = response.message || 'Failed to load revenue data';
        }
        this.loading.revenue = false;
      },
      error: (error: ApiResponse<any>) => {
        this.errors['revenue'] = error.message || 'Error loading revenue data';
        this.loading.revenue = false;
      },
    });
  }

  loadUserRegistrationData(period: string = this.selectedPeriod): void {
    this.loading.userRegistrations = true;
    this.errors['userRegistrations'] = '';
    this.dashboardService.getUserRegistrationStats(period).subscribe({
      next: (response: ApiResponse<ChartData>) => {
        if (response.success) {
          this.userRegistrationData = response.data;
        } else {
          this.errors['userRegistrations'] = response.message || 'Failed to load user registration data';
        }
        this.loading.userRegistrations = false;
      },
      error: (error: ApiResponse<any>) => {
        this.errors['userRegistrations'] = error.message || 'Error loading user registration data';
        this.loading.userRegistrations = false;
      },
    });
  }

  loadTransactions(): void {
    this.loading.transactions = true;
    this.errors['transactions'] = '';
    this.dashboardService.getTransactions().subscribe({
      next: (response: ApiResponse<Transaction[]>) => {
        if (response.success) {
          this.transactions = response.data;
        } else {
          this.errors['transactions'] = response.message || 'Failed to load transactions';
        }
        this.loading.transactions = false;
      },
      error: (error: ApiResponse<any>) => {
        this.errors['transactions'] = error.message || 'Error loading transactions';
        this.loading.transactions = false;
      },
    });
  }

  loadSubscriptions(): void {
    this.loading.subscriptions = true;
    this.errors['subscriptions'] = '';
    this.dashboardService.getSubscriptions().subscribe({
      next: (response: ApiResponse<Subscription[]>) => {
        if (response.success) {
          this.subscriptions = response.data;
        } else {
          this.errors['subscriptions'] = response.message || 'Failed to load subscriptions';
        }
        this.loading.subscriptions = false;
      },
      error: (error: ApiResponse<any>) => {
        this.errors['subscriptions'] = error.message || 'Error loading subscriptions';
        this.loading.subscriptions = false;
      },
    });
  }

  loadActivities(): void {
    this.loading.activities = true;
    this.errors['activities'] = '';
    this.dashboardService.getRecentActivities().subscribe({
      next: (response: ApiResponse<Activity[]>) => {
        if (response.success) {
          this.activities = response.data;
        } else {
          this.errors['activities'] = response.message || 'Failed to load activities';
        }
        this.loading.activities = false;
      },
      error: (error: ApiResponse<any>) => {
        this.errors['activities'] = error.message || 'Error loading activities';
        this.loading.activities = false;
      },
    });
  }

  changePeriod(period: string): void {
    this.selectedPeriod = period;
    this.loadRevenueData(period);
    this.loadUserRegistrationData(period);
  }
}