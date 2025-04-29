import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatCard } from '../../../../core/models/admin/finance.interfaces';
import { TableColumn, ReusableTableComponent, PageEvent } from '../../../../shared/reusable-table/reusable-table.component';
import { FinanceService } from '../../../../core/services/admin/finance/finance.service';

interface RevenueData {
  _id: string;
  event: string;
  eventName?: string;
  admin_percentage: number;
  total_revenue: number;
  total_participants: number;
  admin_amount: number;
  organizer_amount: number;
  is_distributed: boolean;
  distributed_at: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-finance-revenue',
  standalone: true,
  imports: [CommonModule, FormsModule, ReusableTableComponent],
  templateUrl: './finance-revenue.component.html',
  styleUrl: './finance-revenue.component.css'
})
export class FinanceRevenueComponent implements OnInit {
  statCards: StatCard[] = [
    {
      title: 'Total Revenue',
      value: '0.00',
      change: '0% vs last month',
      isNegative: false
    },
    {
      title: 'Today\'s Revenue',
      value: '0.00',
      change: '0% vs yesterday',
      isNegative: false
    },
    {
      title: 'This Month',
      value: '0.00',
      change: '0% vs last month',
      isNegative: false
    }
  ];
  
  tableColumns: TableColumn[] = [
    { key: 'eventName', header: 'Event Name' },
    { key: 'distributed_at', header: 'Distributed Date' },
    { key: 'total_participants', header: 'Total Bookings' },
    { key: 'organizer_amount', header: 'Organizer Amount' },
    { key: 'admin_amount', header: 'Admin Amount' },
    { key: 'admin_percentage', header: 'Commission %' }
  ];

  revenueData: any[] = [];
  currentPage: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 5;
  isLoading: boolean = false;
  
  constructor(
    private financeService: FinanceService,
  ) {}
  
  ngOnInit(): void {
    this.loadRevenueData();
    this.loadStatCardData();
  }
  
  loadRevenueData(page: number = 1): void {
    this.isLoading = true;
    this.financeService.getDistributedRevenue(page, this.itemsPerPage).subscribe({
      next: (response: any) => {
        this.totalItems = response.total || 0;
        this.revenueData = [];
        
        if (response && response.length > 0) {
          const revenueItems = response;
          const eventIds = revenueItems.map((item: { event: any; }) => item.event);
          
          this.financeService.getEventsByIds(eventIds).subscribe({
            next: (events: any[]) => {
              const eventMap = new Map();
              events.forEach(event => {
                eventMap.set(event._id, event.eventTitle);
              });
              
              this.revenueData = revenueItems.map((item: any) => {
                const organizerAmount = this.safeGetNumericValue(item.organizer_amount);
                const adminAmount = this.safeGetNumericValue(item.admin_amount);
                const totalRevenue = this.safeGetNumericValue(item.total_revenue);
                
                return {
                  ...item,
                  eventName: eventMap.get(item.event) || 'Unknown Event',
                  distributed_at: this.formatDate(item.distributed_at),
                  organizer_amount: this.formatCurrency(organizerAmount),
                  admin_amount: this.formatCurrency(adminAmount),
                  total_revenue: this.formatCurrency(totalRevenue),
                  admin_percentage: item.admin_percentage ? 
                    `${this.safeGetNumericValue(item.admin_percentage)}%` : '0%'
                };
              });
              
              this.isLoading = false;
            },
            error: (err) => {
              console.error('Error fetching event data:', err);
              this.isLoading = false;
            }
          });
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error fetching revenue data:', err);
        this.isLoading = false;
      }
    });
  }

  safeGetNumericValue(value: any): number {
    if (value === null || value === undefined) return 0;
    
    if (typeof value === 'number') return value;
    
    if (value && typeof value === 'object' && value.hasOwnProperty('$numberDecimal')) {
      return parseFloat(value.$numberDecimal);
    }
    
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  formatCurrency(value: any): string {
    const numValue = this.safeGetNumericValue(value);
    return numValue === 0 ? '₹0.00' : `₹${numValue.toFixed(2)}`;
  }
  
  loadStatCardData(): void {
    this.financeService.getRevenueStats().subscribe({
      next: (stats: any) => {
        if (stats) {
          this.statCards = [
            {
              title: 'Total Revenue',
              value: this.formatCurrency(stats.totalRevenue || 0),
              change: `${stats.totalRevenueChange || 0}% vs last month`,
              isNegative: (stats.totalRevenueChange || 0) < 0
            },
            {
              title: 'Today\'s Revenue',
              value: this.formatCurrency(stats.todayRevenue || 0),
              change: `${stats.todayRevenueChange || 0}% vs yesterday`,
              isNegative: (stats.todayRevenueChange || 0) < 0
            },
            {
              title: 'This Month',
              value: this.formatCurrency(stats.monthRevenue || 0),
              change: `${stats.monthRevenueChange || 0}% vs last month`,
              isNegative: (stats.monthRevenueChange || 0) < 0
            }
          ];
        }
      },
      error: (err) => {
        console.error('Error fetching revenue stats:', err);
      }
    });
  }
  
  onPageChange(event: PageEvent): void {
    this.currentPage = event.page || 1;
    this.loadRevenueData(this.currentPage);
  }
  
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}