  import { Component, OnInit, OnDestroy } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { ReusableTableComponent, TableColumn } from '../../../../shared/reusable-table/reusable-table.component';
  import { Subscription } from 'rxjs';
  import { FinanceService, Transaction } from '../../../../core/services/admin/finance/finance.service';
  import { DatePickerModule } from 'primeng/datepicker';
  import { DialogModule } from 'primeng/dialog';
  import { ButtonModule } from 'primeng/button';
import { Filter } from '../../../../core/models/admin/finance.interfaces';

 
  @Component({
    selector: 'app-finance-refund',
    imports: [CommonModule, FormsModule, ReusableTableComponent, DatePickerModule, DialogModule, ButtonModule],
    templateUrl: './finance-refund.component.html',
    styleUrl: './finance-refund.component.css'
  })
  export class FinanceRefundComponent implements OnInit, OnDestroy {
    tableColumns: TableColumn[] = [
      { key: 'transactionId', header: 'Transaction ID' },
      { key: 'bookingId', header: 'Booking ID' },
      { key: 'date', header: 'Refund Date' },
      { key: 'ticketType', header: 'Ticket Type' },
      { key: 'quantity', header: 'Quantity' },
      { key: 'originalPrice', header: 'Original Price', type: 'amount' },
      { key: 'refundAmount', header: 'Refund Amount', type: 'amount' },
    ];
    
    refundTransactions: Transaction[] = [];
    currentPage: number = 1;
    totalItems: number = 0;
    itemsPerPage: number = 5;
    searchTerm: string = '';
    loading: boolean = false;
    
    showRefundDetails: boolean = false;
    selectedRefund: any = null;
    
    statusOptions: string[] = ['All', 'completed', 'pending', 'failed'];
    dateRangeOptions: string[] = ['Today', 'This Week', 'This Month', 'Custom Range'];
    
    filters: Filter = {
      startDate: '',
      endDate: '',
    };
    
    selectedDateRange: string = 'This Month';
    customStartDate: string = '';
    customEndDate: string = '';
    startDateValue: Date | null = null;
    endDateValue: Date | null = null;
    showCustomDateRange: boolean = false;
    
    private subscriptions: Subscription = new Subscription();
    
    constructor(private financeService: FinanceService) {}

    ngOnInit(): void {
      if (this.customStartDate) {
        this.startDateValue = new Date(this.customStartDate);
      }
      if (this.customEndDate) {
        this.endDateValue = new Date(this.customEndDate);
      }
      this.initDateFilters();
      this.fetchRefundTransactions();
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
    
    fetchRefundTransactions(): void {
      this.loading = true;
      const sub = this.financeService.getRefundTransactions(
        this.currentPage,
        this.itemsPerPage
      ).subscribe({
        next: (response) => {
          console.log(response.data);
          
          if (Array.isArray(response.data) && response.data.length > 0) {
            const transactionData = Array.isArray(response.data[0]) 
              ? response.data.flat() 
              : response.data;
              
            this.refundTransactions = transactionData.map((item: any) => {
              return {
                transactionId: item.transactionId,
                bookingId: item.metadata?.bookingId || 'N/A',
                date: new Date(item.date).toLocaleDateString(),
                ticketType: item.metadata?.ticketType || 'N/A',
                quantity: item.metadata?.quantity || 0,
                originalPrice: `₹${item.metadata?.originalPrice?.toFixed(2) || '0.00'}`,
                refundAmount: `₹${item.amount.toFixed(2)}`,
                rawData: item,
                eventName: item.metadata?.eventName || 'N/A',
                organizer: item.metadata?.organizer || 'N/A',
                amount: item.amount,
                status: item.status || 'pending'
              };
            });
          } else {
            this.refundTransactions = [];
          }
          
          this.totalItems = response.totalItems ?? 0;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching refund transactions:', error);
          this.loading = false;
        }
      });
      
      this.subscriptions.add(sub);
    }
    
    onPageChange(event: any): void {
      this.currentPage = event.pageIndex + 1;
      this.fetchRefundTransactions();
    }
    
    onSearchChange(searchTerm: string): void {
      this.searchTerm = searchTerm;
      this.currentPage = 1; 
      this.fetchRefundTransactions();
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

    applyCustomDateRange(): void {
      if (this.customStartDate && this.customEndDate) {
        this.filters.startDate = this.customStartDate;
        this.filters.endDate = this.customEndDate;
        this.applyFilters();
      }
    }
    
    applyFilters(): void {
      this.currentPage = 1;
      this.fetchFilteredRefunds();
    }
    
    fetchFilteredRefunds(): void {
      this.loading = true;
      
      const startDate = this.filters.startDate;
      const endDate = this.filters.endDate;
      
      const sub = this.financeService.getRefundsByDateRange(
        startDate, 
        endDate,
        this.currentPage,
        this.itemsPerPage,
        this.searchTerm
      ).subscribe({
        next: (response) => {
          this.refundTransactions = response.data.map((item: any) => {
            return {
              transactionId: item.transactionId,
              bookingId: item.metadata?.bookingId || 'N/A',
              date: new Date(item.date).toLocaleDateString(),
              ticketType: item.metadata?.ticketType || 'N/A',
              quantity: item.metadata?.quantity || 0,
              originalPrice: `₹${item.metadata?.originalPrice?.toFixed(2) || '0.00'}`,
              refundAmount: `₹${item.amount.toFixed(2)}`,
              rawData: item,
              eventName: item.metadata?.eventName || 'N/A',
              organizer: item.metadata?.organizer || 'N/A',
              amount: item.amount,
              status: item.status || 'pending'
            };
          });
          
          this.totalItems = response.totalItems || response.data.length;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching filtered refund data:', error);
          this.loading = false;
        }
      });
      
      this.subscriptions.add(sub);
    }
    
    resetFilters(): void {
      this.filters = {
        startDate: '',
        endDate: '',
      };
      
      this.selectedDateRange = 'This Month';
      this.showCustomDateRange = false;
      this.searchTerm = '';
      this.initDateFilters();
      this.fetchRefundTransactions();
    }

  }
