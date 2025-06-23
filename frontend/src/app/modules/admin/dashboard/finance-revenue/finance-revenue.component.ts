import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { TableColumn, ReusableTableComponent, PageEvent } from '../../../../shared/reusable-table/reusable-table.component';
import { FinanceService } from '../../../../core/services/admin/finance/finance.service';
import { DateRange, RevenueData } from '../../../../core/interfaces/admin/finance.revenue';

@Component({
  selector: 'app-finance-revenue',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ReusableTableComponent],
  templateUrl: './finance-revenue.component.html',
  styleUrl: './finance-revenue.component.css'
})
export class FinanceRevenueComponent implements OnInit, OnDestroy {
  
  public tableColumns: TableColumn[] = [
    { key: 'eventName', header: 'Event Name' },
    { key: 'distributed_at', header: 'Distributed Date' },
    { key: 'total_participants', header: 'Total Bookings' },
    { key: 'organizer_amount', header: 'Organizer Amount' },
    { key: 'admin_amount', header: 'Admin Amount' },
    { key: 'admin_percentage', header: 'Commission %' }
  ];

  public revenueData: RevenueData[] = [];
  public filteredRevenueData: RevenueData[] = [];
  
  public currentPage = 1;
  public totalItems = 0;
  public itemsPerPage = 5;
  
  public isLoading = false;
  public searchTerm = '';
  
  public filterForm: FormGroup;
  public filterOptions: string[] = ['All', 'Daily', 'Weekly', 'Monthly', 'Custom'];
  public selectedFilter = 'All';
  public showCustomDatePicker = false;
  
  private _customDateRange: DateRange = {
    startDate: new Date(),
    endDate: new Date()
  };
  
  private _allRevenueData: RevenueData[] = []; 
  private _destroy$ = new Subject<void>();
  private _searchSubject$ = new Subject<string>();
  
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
  
  ngOnInit(): void {
    this._initializeSearchHandler();
    this._initializeFilterHandler();
    this._loadRevenueData();
  }
  
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
  
  private _initializeSearchHandler(): void {
    this._searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._destroy$)
      )
      .subscribe(searchTerm => {
        this.searchTerm = searchTerm;
        this._applyClientSideFilter();
      });
  }
  
  private _initializeFilterHandler(): void {
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
  
  public onSearchChange(searchTerm: string): void {
    this._searchSubject$.next(searchTerm);
  }
  
  public applyFilter(): void {
    this.isLoading = true;
    this.currentPage = 1;
    this.searchTerm = ''; 
    
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
    
    this._financeService.getRevenueByDateRange(startDate, endDate, 1, 1000)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response: any) => {
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
                  
                  this._allRevenueData = this._processRevenueData(revenueItems, eventMap);
                  this.totalItems = this._allRevenueData.length;
                  this.filteredRevenueData = [...this._allRevenueData];
                  this._updateDisplayedData();
                  this.isLoading = false;
                },
                error: (err) => {
                  console.error('Error fetching event data:', err);
                  this._handleError();
                }
              });
          } else {
            this._allRevenueData = [];
            this.totalItems = 0;
            this.filteredRevenueData = [];
            this._updateDisplayedData();
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error('Error fetching filtered revenue data:', err);
          this._handleError();
        }
      });
  }
  
  private _applyClientSideFilter(): void {
    let filteredData = [...this._allRevenueData];
    
    if (this.searchTerm && this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filteredData = filteredData.filter(item => 
        item.eventName?.toLowerCase().includes(searchLower) ||
        item.distributed_at?.toLowerCase().includes(searchLower) ||
        item.organizer_amount?.toString().toLowerCase().includes(searchLower) ||
        item.admin_amount?.toString().toLowerCase().includes(searchLower)
      );
    }
    
    this.filteredRevenueData = filteredData;
    this.totalItems = filteredData.length;
    
    // Reset to first page if current page is out of bounds
    const maxPage = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage > maxPage && maxPage > 0) {
      this.currentPage = 1;
    }
    
    this._updateDisplayedData();
  }
  
  private _updateDisplayedData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.revenueData = this.filteredRevenueData.slice(startIndex, endIndex);
  }
  
  public onPageChange(event: PageEvent): void {
    this.currentPage = event.page || 1;
    this._updateDisplayedData();
  }
  
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
  
  private _getFormattedDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
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
  
  private _loadRevenueData(): void {
    this.isLoading = true;
    
    this._financeService.getDistributedRevenue(1, 1000) 
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response: any) => {
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
                  
                  this._allRevenueData = this._processRevenueData(revenueItems, eventMap);
                  this.totalItems = this._allRevenueData.length;
                  this.filteredRevenueData = [...this._allRevenueData];
                  this._updateDisplayedData();
                  this.isLoading = false;
                },
                error: (err) => {
                  console.error('Error fetching event data:', err);
                  this._handleError();
                }
              });
          } else {
            this._handleEmptyData();
          }
        },
        error: (err) => {
          console.error('Error fetching revenue data:', err);
          this._handleError();
        }
      });
  }
  
  private _handleError(): void {
    this.isLoading = false;
    this.revenueData = [];
    this._allRevenueData = [];
    this.filteredRevenueData = [];
    this.totalItems = 0;
  }
  
  private _handleEmptyData(): void {
    this.isLoading = false;
    this.revenueData = [];
    this._allRevenueData = [];
    this.filteredRevenueData = [];
    this.totalItems = 0;
  }
  
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
  
  private _safeGetNumericValue(value: any): number {
    if (value === null || value === undefined) return 0;
    
    if (typeof value === 'number') return value;
    
    if (value && typeof value === 'object' && value.hasOwnProperty('$numberDecimal')) {
      return parseFloat(value.$numberDecimal);
    }
    
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  private _formatCurrency(value: any): string {
    const numValue = this._safeGetNumericValue(value);
    return numValue === 0 ? '₹0.00' : `₹${numValue.toFixed(2)}`;
  }
}