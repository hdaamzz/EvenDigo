import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReusableTableComponent, TableColumn } from '../../../../shared/reusable-table/reusable-table.component';
import { catchError, of, Subscription, tap } from 'rxjs';
import { FinanceService, RevenueStats, Transaction } from '../../../../core/services/admin/finance/finance.service';
import { DatePickerModule } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown'; // Import PrimeNG Dropdown
import { Filter, StatCard } from '../../../../core/models/admin/finance.interfaces';
import { AdminUsersService } from '../../../../core/services/admin/users/admin.users.service';
import { User } from '../../../../core/models/userModel';
import Notiflix from 'notiflix';

@Component({
  selector: 'app-finance-booking',
  imports: [CommonModule, FormsModule, ReusableTableComponent, DatePickerModule, DropdownModule],
  templateUrl: './finance-booking.component.html',
  styleUrl: './finance-booking.component.css'
})
export class FinanceBookingComponent implements OnInit, OnDestroy {
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
    { key: 'bookingId', header: 'Booking ID' },
    { key: 'date', header: 'Booking Date' },
    { key: 'ticketDetails', header: 'Ticket Details' },
    { key: 'paymentType', header: 'Payment Method' },
    { key: 'amount', header: 'Amount', type: 'amount' },
  ];
  
  transactions: Transaction[] = [];
  currentPage: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 5;
  searchTerm: string = '';
  loading: boolean = false;
  
  dateRangeOptions: string[] = ['Today','This Week', 'This Month', 'Custom Range'];
  
  filters: Filter = {
    startDate: '',
    endDate: '',
    userId: ''
  };
  
  selectedDateRange: string = 'This Month';
  customStartDate: string = '';
  customEndDate: string = '';
  startDateValue: Date | null = null;
  endDateValue: Date | null = null;
  showCustomDateRange: boolean = false;
  
  filterOptions: string[] = ['Date Range', 'User'];
  selectedFilterOption: string = 'Date Range';
  users: User[] = []; 
  selectedUser: any = null;
  
  private subscriptions: Subscription = new Subscription();
  
  constructor(private financeService: FinanceService,
    private userService:AdminUsersService
  ) {}

  ngOnInit(): void {
    if (this.customStartDate) {
      this.startDateValue = new Date(this.customStartDate);
    }
    if (this.customEndDate) {
      this.endDateValue = new Date(this.customEndDate);
    }
    this.initDateFilters();
    this.fetchRevenueStats();
    this.fetchRevenue();
    this.fetchUsers(); 
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
  initDateFilters(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    this.filters.startDate = firstDayOfMonth.toISOString().split('T')[0];
    this.filters.endDate = today.toISOString().split('T')[0];
  }
  
  fetchRevenueStats(): void {
    this.loading = true;
    const sub = this.financeService.fetchRevenueStats().subscribe({
      next: (stats: RevenueStats) => {
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
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching revenue stats:', error);
        this.loading = false;
      }
    });
    
    this.subscriptions.add(sub);
  }
  
  fetchRevenue(): void {
    this.loading = true;
    const sub = this.financeService.fetchRevenue(this.currentPage, this.itemsPerPage).subscribe({
      next: (response) => {
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
        
        this.totalItems = response.totalItems;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching revenue data:', error);
        this.loading = false;
      }
    });
    
    this.subscriptions.add(sub);
  }
  
  fetchUsers(): void {
    this.userService.usersList().pipe(
          tap((response) => {
            if (response.success) {
              this.users = response.data;
            } else {
              console.error('Failed to fetch users:', response.message);
              Notiflix.Notify.failure(response.message);
            }
          }),
          catchError((error) => {
            console.error('Error fetching users:', error);
            Notiflix.Notify.failure('Error fetching users');
            return of(null);
          })
        ).subscribe();
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.fetchRevenue();
  }
  
  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.currentPage = 1; 
    this.fetchRevenue();
  }
  
  onDateRangeChange(range: string): void {
    this.selectedDateRange = range;
    const today = new Date();
    
    this.showCustomDateRange = range === 'Custom Range';
    
    switch(range) {
      case 'Today':
        this.filters.startDate = today.toISOString().split('T')[0];
        this.filters.endDate = today.toISOString().split('T')[0];
        break;
      case 'This Week':
        const firstDayOfWeek = new Date(today);
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        firstDayOfWeek.setDate(diff);
        this.filters.startDate = firstDayOfWeek.toISOString().split('T')[0];
        this.filters.endDate = today.toISOString().split('T')[0];
        break;
      case 'This Month':
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        this.filters.startDate = firstDayOfMonth.toISOString().split('T')[0];
        this.filters.endDate = today.toISOString().split('T')[0];
        break;
      case 'Custom Range':
        return;
    }
    
    this.applyFilters();
  }
  
  onStartDateSelect(event: any): void {
    this.customStartDate = event.toISOString().split('T')[0];
  }
  
  onEndDateSelect(event: any): void {
    this.customEndDate = event.toISOString().split('T')[0];
  }
  
  onFilterOptionChange(option: string): void {
    this.selectedFilterOption = option;
    this.resetFilters();
  }
  
  onUserSelect(user: any): void {
    this.selectedUser = user;
    this.filters.userId = user ? user._id : '';
    this.applyFilters();
  }
  
  applyCustomDateRange(): void {
    if (this.customStartDate && this.customEndDate) {
      this.filters.startDate = this.customStartDate;
      this.filters.endDate = this.customEndDate;
      this.applyFilters();
    }
  }
  
  applyFilters(): void {
    this.currentPage = 1;
    
    if (this.selectedFilterOption === 'User' && this.selectedUser) {
      this.fetchTransactionsByUser();
    } else {
      this.fetchFilteredRevenue();
    }
  }
  
  fetchFilteredRevenue(): void {
    this.loading = true;
    
    const startDate = this.filters.startDate;
    const endDate = this.filters.endDate;
    
    const sub = this.financeService.getTransactionByDateRange(startDate, endDate).subscribe({
      next: (response) => {
        console.log("date", response.data);
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
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching filtered revenue data:', error);
        this.loading = false;
      }
    });
    
    this.subscriptions.add(sub);
  }
  
  fetchTransactionsByUser(): void {
    this.loading = true;
    console.log(this.filters.userId);
    
    if (!this.filters.userId) {
      return;
    }

    const sub = this.financeService.getTransactionsByUser(this.filters.userId, this.currentPage, this.itemsPerPage).subscribe({
      next: (response) => {
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
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching user transactions:', error);
        this.loading = false;
      }
    });
    
    this.subscriptions.add(sub);
  }
  
  resetFilters(): void {
    this.filters = {
      startDate: '',
      endDate: '',
      userId: ''
    };
    
    this.selectedDateRange = 'This Month';
    this.showCustomDateRange = false;
    this.searchTerm = '';
    this.selectedUser = null;
    
    if (this.selectedFilterOption === 'Date Range') {
      this.initDateFilters();
    }
    
    this.fetchRevenue();
  }
  
  viewBookingDetails(booking: any): void {
    console.log('View booking details:', booking.rawData);
  }
}