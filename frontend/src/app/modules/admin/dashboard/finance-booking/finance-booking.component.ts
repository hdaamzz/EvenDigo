import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReusableTableComponent, TableColumn } from '../../../../shared/reusable-table/reusable-table.component';
import { Observable, Subject, catchError, of, takeUntil, tap } from 'rxjs';
import { FinanceService } from '../../../../core/services/admin/finance/finance.service';
import { DatePickerModule } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { Filter, StatCard } from '../../../../core/models/admin/finance.interfaces';
import { AdminUsersService } from '../../../../core/services/admin/users/admin.users.service';
import { User } from '../../../../core/models/userModel';
import Notiflix from 'notiflix';
import { DateRangeOption, FilterOption } from '../../../../core/types/admin.finance';
import { RevenueStats, Transaction } from '../../../../core/interfaces/admin/finance.revenue';


@Component({
  selector: 'app-finance-booking',
  imports: [CommonModule, FormsModule, ReusableTableComponent, DatePickerModule, DropdownModule],
  templateUrl: './finance-booking.component.html',
  styleUrl: './finance-booking.component.css'
})
export class FinanceBookingComponent implements OnInit, OnDestroy {
  statCards: StatCard[] = this._getInitialStatCards();
  tableColumns: TableColumn[] = this._getTableColumns();
  transactions: Transaction[] = [];
  currentPage = 1;
  totalItems = 0;
  itemsPerPage = 5;
  searchTerm = '';
  loading = false;
  
  dateRangeOptions = Object.values(DateRangeOption);
  selectedDateRange: string = DateRangeOption.THIS_MONTH;
  customStartDate = '';
  customEndDate = '';
  startDateValue: Date | null = null;
  endDateValue: Date | null = null;
  showCustomDateRange = false;
  
  // Filter options
  filterOptions = Object.values(FilterOption);
  selectedFilterOption: string = FilterOption.DATE_RANGE;
  users: User[] = []; 
  selectedUser: User | null = null;
  
  // Filter state
  filters: Filter = {
    startDate: '',
    endDate: '',
    userId: ''
  };
  
  // Subject for unsubscribing from all observables
  private readonly _destroy$ = new Subject<void>();
  
  constructor(
    private _financeService: FinanceService,
    private _userService: AdminUsersService
  ) {}

  /**
   * Initialize component, set up date filters and fetch initial data
   */
  ngOnInit(): void {
    this._initializeDateValues();
    this._initDateFilters();
    this._fetchRevenueStats();
    this._fetchRevenue();
    this._fetchUsers(); 
  }
  
  /**
   * Clean up subscriptions when component is destroyed
   */
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
  
  /**
   * Handle page change event from the table
   */
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this._fetchRevenue();
  }
  
  /**
   * Handle search term changes
   */
  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.currentPage = 1; 
    this._fetchRevenue();
  }
  
  /**
   * Handle date range selection change
   */
  onDateRangeChange(range: string): void {
    this.selectedDateRange = range;
    this.showCustomDateRange = range === DateRangeOption.CUSTOM_RANGE;
    
    if (range !== DateRangeOption.CUSTOM_RANGE) {
      this._setDateFiltersFromRange(range);
      this.applyFilters();
    }
  }
  
  /**
   * Handle start date selection in custom date range
   */
  onStartDateSelect(event: any): void {
    this.customStartDate = new Date(event).toISOString().split('T')[0];
  }
  
  /**
   * Handle end date selection in custom date range
   */
  onEndDateSelect(event: any): void {
    this.customEndDate = new Date(event).toISOString().split('T')[0];
  }
  
  /**
   * Handle filter option change (Date Range or User)
   */
  onFilterOptionChange(option: string): void {
    this.selectedFilterOption = option;
    this.resetFilters();
  }
  
  /**
   * Handle user selection in user filter
   */
  onUserSelect(user: User | null): void {
    this.selectedUser = user;
    this.filters.userId = user ? user._id : '';
    this.applyFilters();
  }
  
  /**
   * Apply custom date range filter
   */
  applyCustomDateRange(): void {
    if (this.customStartDate && this.customEndDate) {
      this.filters.startDate = this.customStartDate;
      this.filters.endDate = this.customEndDate;
      this.applyFilters();
    }
  }
  
  /**
   * Apply all selected filters
   */
  applyFilters(): void {
    this.currentPage = 1;
    
    if (this.selectedFilterOption === FilterOption.USER && this.selectedUser) {
      this._fetchTransactionsByUser();
    } else {
      this._fetchFilteredRevenue();
    }
  }
  
  /**
   * Reset all filters to default values
   */
  resetFilters(): void {
    this.filters = {
      startDate: '',
      endDate: '',
      userId: ''
    };
    
    this.selectedDateRange = DateRangeOption.THIS_MONTH;
    this.showCustomDateRange = false;
    this.searchTerm = '';
    this.selectedUser = null;
    
    if (this.selectedFilterOption === FilterOption.DATE_RANGE) {
      this._initDateFilters();
    }
    
    this._fetchRevenue();
  }
  
  /**
   * View detailed information for a booking
   */
  viewBookingDetails(booking: any): void {
  }
  
  /**
   * Initialize date filter values from custom dates if available
   * @private
   */
  private _initializeDateValues(): void {
    if (this.customStartDate) {
      this.startDateValue = new Date(this.customStartDate);
    }
    if (this.customEndDate) {
      this.endDateValue = new Date(this.customEndDate);
    }
  }
  
  /**
   * Initialize date filters to current month by default
   * @private
   */
  private _initDateFilters(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    this.filters.startDate = firstDayOfMonth.toISOString().split('T')[0];
    this.filters.endDate = today.toISOString().split('T')[0];
  }
  
  /**
   * Set date filters based on selected range option
   * @private
   */
  private _setDateFiltersFromRange(range: string): void {
    const today = new Date();
    
    switch(range) {
      case DateRangeOption.TODAY:
        this.filters.startDate = today.toISOString().split('T')[0];
        this.filters.endDate = today.toISOString().split('T')[0];
        break;
      case DateRangeOption.THIS_WEEK:
        const firstDayOfWeek = new Date(today);
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        firstDayOfWeek.setDate(diff);
        this.filters.startDate = firstDayOfWeek.toISOString().split('T')[0];
        this.filters.endDate = today.toISOString().split('T')[0];
        break;
      case DateRangeOption.THIS_MONTH:
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        this.filters.startDate = firstDayOfMonth.toISOString().split('T')[0];
        this.filters.endDate = today.toISOString().split('T')[0];
        break;
    }
  }
  
  /**
   * Create the initial empty stat cards
   * @private
   */
  private _getInitialStatCards(): StatCard[] {
    return [
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
  }
  
  /**
   * Define the table columns configuration
   * @private
   */
  private _getTableColumns(): TableColumn[] {
    return [
      { key: 'bookingId', header: 'Booking ID' },
      { key: 'date', header: 'Booking Date' },
      { key: 'ticketDetails', header: 'Ticket Details' },
      { key: 'paymentType', header: 'Payment Method' },
      { key: 'amount', header: 'Amount', type: 'amount' },
    ];
  }
  
  /**
   * Fetch revenue statistics
   * @private
   */
  private _fetchRevenueStats(): void {
    this.loading = true;
    
    this._financeService.fetchRevenueStats()
      .pipe(
        takeUntil(this._destroy$),
        catchError(error => {
          console.error('Error fetching revenue stats:', error);
          this.loading = false;
          Notiflix.Notify.failure('Failed to load revenue statistics');
          return of({} as RevenueStats);
        })
      )
      .subscribe(stats => {
        if (Object.keys(stats).length > 0) {
          this._updateStatCards(stats);
        }
        this.loading = false;
      });
  }
  
  /**
   * Update stat cards with the fetched data
   * @private
   */
  private _updateStatCards(stats: RevenueStats): void {
    this.statCards = [
      {
        title: 'Total Revenue',
        value: stats.totalRevenue,
        change: `${Math.abs(stats.totalRevenueChange)}% vs last month`,
        isNegative: stats.totalRevenueChange < 0
      },
      {
        title: 'Today\'s Revenue',
        value: stats.todayRevenue,
        change: `${Math.abs(stats.todayRevenueChange)}% vs yesterday`,
        isNegative: stats.todayRevenueChange < 0
      },
      {
        title: 'This Month',
        value: stats.monthlyRevenue,
        change: `${Math.abs(stats.monthlyRevenueChange)}% vs last month`,
        isNegative: stats.monthlyRevenueChange < 0
      }
    ];
  }
  
  /**
   * Fetch revenue transactions
   * @private
   */
  private _fetchRevenue(): void {
    this.loading = true;
    
    this._financeService.fetchRevenue(this.currentPage, this.itemsPerPage)
      .pipe(
        takeUntil(this._destroy$),
        catchError(error => {
          console.error('Error fetching revenue data:', error);
          this.loading = false;
          Notiflix.Notify.failure('Failed to load revenue data');
          return of({ data: [], totalItems: 0 });
        })
      )
      .subscribe(response => {
        this._processTransactionsResponse(response);
        this.loading = false;
      });
  }
  
  /**
   * Fetch users for user filter dropdown
   * @private
   */
  private _fetchUsers(): void {
    this._userService.usersList()
      .pipe(
        takeUntil(this._destroy$),
        tap(response => {
          if (response.success) {
            this.users = response.data;
          } else {
            console.error('Failed to fetch users:', response.message);
            Notiflix.Notify.failure(response.message || 'Failed to load users');
          }
        }),
        catchError(error => {
          console.error('Error fetching users:', error);
          Notiflix.Notify.failure('Error fetching users');
          return of(null);
        })
      )
      .subscribe();
  }
  
  /**
   * Fetch transactions filtered by date range
   * @private
   */
  private _fetchFilteredRevenue(): void {
    this.loading = true;
    
    this._financeService.getTransactionByDateRange(this.filters.startDate, this.filters.endDate)
      .pipe(
        takeUntil(this._destroy$),
        catchError(error => {
          console.error('Error fetching filtered revenue data:', error);
          this.loading = false;
          Notiflix.Notify.failure('Failed to filter transactions by date');
          return of({ data: [], totalItems: 0 });
        })
      )
      .subscribe(response => {
        this._processTransactionsResponse(response);
        this.loading = false;
      });
  }
  
  /**
   * Fetch transactions filtered by user
   * @private
   */
  private _fetchTransactionsByUser(): void {
    if (!this.filters.userId) {
      return;
    }
    
    this.loading = true;
    
    this._financeService.getTransactionsByUser(this.filters.userId, this.currentPage, this.itemsPerPage)
      .pipe(
        takeUntil(this._destroy$),
        catchError(error => {
          console.error('Error fetching user transactions:', error);
          this.loading = false;
          Notiflix.Notify.failure('Failed to load user transactions');
          return of({ data: [], totalItems: 0 });
        })
      )
      .subscribe(response => {
        this._processTransactionsResponse(response);
        this.loading = false;
      });
  }
  
  /**
   * Process and map transaction response data to display format
   * @private
   */
  private _processTransactionsResponse(response: any): void {
    if (!response || !response.data) {
      this.transactions = [];
      this.totalItems = 0;
      return;
    }
    
    this.transactions = response.data.map((item: any) => {
      const ticketDetails = item.tickets.map((ticket: any) => 
        `${ticket.type} (${ticket.quantity}x)`
      ).join(', ');
      
      return {
        bookingId: item.bookingId,
        date: new Date(item.createdAt).toLocaleDateString(),
        ticketDetails: ticketDetails,
        paymentType: item.paymentType,
        amount: `${item.totalAmount.toFixed(2)}`,
        rawData: item
      };
    });
    
    this.totalItems = response.totalItems || response.data.length;
  }
}