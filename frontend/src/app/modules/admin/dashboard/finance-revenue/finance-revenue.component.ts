import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { StatCard } from '../../../../core/models/admin/finance.interfaces';
import { TableColumn, ReusableTableComponent, PageEvent } from '../../../../shared/reusable-table/reusable-table.component';
import { FinanceService } from '../../../../core/services/admin/finance/finance.service';

/**
 * Interface representing revenue data from the API
 */
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

/**
 * Interface representing a date range for filtering
 */
interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Finance Revenue Component
 * 
 * Displays and manages revenue data including statistics and filterable revenue transactions
 */
@Component({
  selector: 'app-finance-revenue',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ReusableTableComponent],
  templateUrl: './finance-revenue.component.html',
  styleUrl: './finance-revenue.component.css'
})
export class FinanceRevenueComponent implements OnInit, OnDestroy {
  /** Statistical cards displayed at the top of the page */
  public statCards: StatCard[] = [
    {
      title: 'Total Revenue',
      value: '₹0.00',
      change: '0% vs last month',
      isNegative: false
    },
    {
      title: 'Today\'s Revenue',
      value: '₹0.00',
      change: '0% vs yesterday',
      isNegative: false
    },
    {
      title: 'This Month',
      value: '₹0.00',
      change: '0% vs last month',
      isNegative: false
    }
  ];
  
  /** Table column configuration */
  public tableColumns: TableColumn[] = [
    { key: 'eventName', header: 'Event Name' },
    { key: 'distributed_at', header: 'Distributed Date' },
    { key: 'total_participants', header: 'Total Bookings' },
    { key: 'organizer_amount', header: 'Organizer Amount' },
    { key: 'admin_amount', header: 'Admin Amount' },
    { key: 'admin_percentage', header: 'Commission %' }
  ];

  /** Revenue data displayed in the table */
  public revenueData: RevenueData[] = [];
  
  /** Pagination properties */
  public currentPage = 1;
  public totalItems = 0;
  public itemsPerPage = 5;
  
  /** Loading state for API requests */
  public isLoading = false;
  
  /** Filter form and options */
  public filterForm: FormGroup;
  public filterOptions: string[] = ['All', 'Daily', 'Weekly', 'Monthly', 'Custom'];
  public selectedFilter = 'All';
  public showCustomDatePicker = false;
  
  /** Custom date range for filtering */
  private _customDateRange: DateRange = {
    startDate: new Date(),
    endDate: new Date()
  };
  
  /** Subject for unsubscribing from observables */
  private _destroy$ = new Subject<void>();
  
  /**
   * @param financeService Service for finance-related API calls
   * @param fb FormBuilder for creating reactive forms
   */
  constructor(
    private _financeService: FinanceService,
    private _fb: FormBuilder
  ) {
    this.filterForm = this._fb.group({
      filterType: ['All'],
      startDate: [this._getFormattedDate(new Date())],
      endDate: [this._getFormattedDate(new Date())]
    });
  }
  
  /**
   * Lifecycle hook that is called after data-bound properties are initialized
   */
  ngOnInit(): void {
    this._loadRevenueData();
    this._loadStatCardData();
    
    // Subscribe to filter type changes
    this.filterForm.get('filterType')?.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(value => {
        this.selectedFilter = value;
        this.showCustomDatePicker = value === 'Custom';
        
        if (value !== 'Custom') {
          const dateRange = this._getDateRangeForFilter(value);
          if (dateRange) {
            this._customDateRange = dateRange;
            this.filterForm.patchValue({
              startDate: this._getFormattedDate(dateRange.startDate),
              endDate: this._getFormattedDate(dateRange.endDate)
            });
          }
          this.applyFilter();
        }
      });
  }
  
  /**
   * Lifecycle hook that is called when the component is destroyed
   */
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
  
  /**
   * Applies the selected filter to the revenue data
   */
  public applyFilter(): void {
    this.isLoading = true;
    this.currentPage = 1;
    
    if (this.selectedFilter === 'All') {
      this._loadRevenueData();
      return;
    }
    
    const startDate = this.filterForm.get('startDate')?.value;
    const endDate = this.filterForm.get('endDate')?.value;
    
    if (!startDate || !endDate) {
      this.isLoading = false;
      return;
    }
    
    this._financeService.getRevenueByDateRange(startDate, endDate, this.currentPage, this.itemsPerPage)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response: any) => {
          this.totalItems = response.total || 0;
          this.revenueData = [];
          
          if (response?.data?.length > 0) {
            const revenueItems = response.data;
            const eventIds = revenueItems.map((item: { event: any; }) => item.event);
            
            this._financeService.getEventsByIds(eventIds)
              .pipe(takeUntil(this._destroy$))
              .subscribe({
                next: (events: any[]) => {
                  const eventMap = new Map<string, string>();
                  events.forEach(event => {
                    eventMap.set(event._id, event.eventTitle);
                  });
                  
                  this.revenueData = this._processRevenueData(revenueItems, eventMap);
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
          console.error('Error fetching filtered revenue data:', err);
          this.isLoading = false;
        }
      });
  }
  
  /**
   * Handles page change events from the reusable table component
   * @param event Page change event containing the new page number
   */
  public onPageChange(event: PageEvent): void {
    this.currentPage = event.page || 1;
    
    if (this.selectedFilter === 'All') {
      this._loadRevenueData(this.currentPage);
    } else {
      this.applyFilter();
    }
  }
  
  /**
   * Formats a date string to a human-readable format
   * @param dateString ISO date string to format
   * @returns Formatted date string
   */
  public formatDate(dateString: string): string {
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
  
  /**
   * Converts a date object to YYYY-MM-DD format
   * @param date Date object to format
   * @returns Formatted date string in YYYY-MM-DD format
   */
  private _getFormattedDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  /**
   * Determines the date range based on the selected filter type
   * @param filterType Type of filter (Daily, Weekly, Monthly, All)
   * @returns DateRange object or null if filter is 'All'
   */
  private _getDateRangeForFilter(filterType: string): DateRange | null {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (filterType) {
      case 'Daily':
        return {
          startDate: today,
          endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case 'Weekly':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return {
          startDate: startOfWeek,
          endDate: endOfWeek
        };
      case 'Monthly':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return {
          startDate: startOfMonth,
          endDate: endOfMonth
        };
      case 'All':
      default:
        return null;
    }
  }
  
  /**
   * Loads revenue data from the API
   * @param page Page number to load (defaults to 1)
   */
  private _loadRevenueData(page: number = 1): void {
    this.isLoading = true;
    
    this._financeService.getDistributedRevenue(page, this.itemsPerPage)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response: any) => {
          this.totalItems = response.total || 0;
          this.revenueData = [];
          
          if (response?.length > 0) {
            const revenueItems = response;
            const eventIds = revenueItems.map((item: { event: any; }) => item.event);
            
            this._financeService.getEventsByIds(eventIds)
              .pipe(takeUntil(this._destroy$))
              .subscribe({
                next: (events: any[]) => {
                  const eventMap = new Map<string, string>();
                  events.forEach(event => {
                    eventMap.set(event._id, event.eventTitle);
                  });
                  
                  this.revenueData = this._processRevenueData(revenueItems, eventMap);
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
  
  /**
   * Processes raw revenue data and formats it for display
   * @param revenueItems Raw revenue items from API
   * @param eventMap Map of event IDs to event names
   * @returns Processed revenue data ready for display
   */
  private _processRevenueData(revenueItems: any[], eventMap: Map<string, string>): RevenueData[] {
    return revenueItems.map((item: any) => {
      const organizerAmount = this._safeGetNumericValue(item.organizer_amount);
      const adminAmount = this._safeGetNumericValue(item.admin_amount);
      const totalRevenue = this._safeGetNumericValue(item.total_revenue);
      
      return {
        ...item,
        eventName: eventMap.get(item.event) || 'Unknown Event',
        distributed_at: this.formatDate(item.distributed_at),
        organizer_amount: this._formatCurrency(organizerAmount),
        admin_amount: this._formatCurrency(adminAmount),
        total_revenue: this._formatCurrency(totalRevenue),
        admin_percentage: item.admin_percentage ? 
          `${this._safeGetNumericValue(item.admin_percentage)}%` : '0%'
      };
    });
  }
  
  /**
   * Safely extracts a numeric value from various possible formats
   * @param value Value to convert to number
   * @returns Numeric value or 0 if conversion fails
   */
  private _safeGetNumericValue(value: any): number {
    if (value === null || value === undefined) return 0;
    
    if (typeof value === 'number') return value;
    
    if (value && typeof value === 'object' && value.hasOwnProperty('$numberDecimal')) {
      return parseFloat(value.$numberDecimal);
    }
    
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  /**
   * Formats a numeric value as a currency string
   * @param value Value to format as currency
   * @returns Formatted currency string
   */
  private _formatCurrency(value: any): string {
    const numValue = this._safeGetNumericValue(value);
    return numValue === 0 ? '₹0.00' : `₹${numValue.toFixed(2)}`;
  }
  
  /**
   * Loads statistical data for the stat cards
   */
  private _loadStatCardData(): void {
    this._financeService.getRevenueStats()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (stats: any) => {
          if (stats) {
            this.statCards = [
              {
                title: 'Total Revenue',
                value: this._formatCurrency(stats.totalRevenue || 0),
                change: `${stats.totalRevenueChange || 0}% vs last month`,
                isNegative: (stats.totalRevenueChange || 0) < 0
              },
              {
                title: 'Today\'s Revenue',
                value: this._formatCurrency(stats.todayRevenue || 0),
                change: `${stats.todayRevenueChange || 0}% vs yesterday`,
                isNegative: (stats.todayRevenueChange || 0) < 0
              },
              {
                title: 'This Month',
                value: this._formatCurrency(stats.monthlyRevenue || 0),
                change: `${stats.monthlyRevenueChange || 0}% vs last month`,
                isNegative: (stats.monthlyRevenueChange || 0) < 0
              }
            ];
          }
        },
        error: (err) => {
          console.error('Error fetching revenue stats:', err);
        }
      });
  }
}