import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ReusableTableComponent, TableColumn } from '../../../../shared/reusable-table/reusable-table.component';
import { SubscriptionService } from '../../../../core/services/admin/subscription/subscription.service';
import { Subscription } from '../../../../core/models/admin/subscription.interface';
import { SubscriptionDetailsDialogComponent } from './subscription-details-dialog/subscription-details-dialog.component';


@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule, ReusableTableComponent],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.css'
})
export class SubscriptionComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  filteredSubscriptions: Subscription[] = [];
  paginatedSubscriptions: Subscription[] = [];
  loading = true;
  private readonly _destroy$ = new Subject<void>();
  searchTerm = '';
  
  stats = {
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    inactiveSubscriptions: 0,
    premiumSubscriptions: 0
  };

  tableColumns: TableColumn[] = [
    { key: 'userName', header: 'User Name' },
    { key: 'type', header: 'Plan Type' },
    { key: 'amount', header: 'Amount' },
    { key: 'status', header: 'Status', type: 'badge', 
      badgeMapping: {
        'active': { color: 'green', bgColor: 'green-100' },
        'inactive': { color: 'red', bgColor: 'red-100' },
        'pending': { color: 'yellow', bgColor: 'yellow-100' }
      }
    },
    { key: 'startDate', header: 'Start Date' },
    { key: 'endDate', header: 'End Date' },
    { key: 'isActive', header: 'Active' },
    { key: 'paymentMethod', header: 'Payment Method' }
  ];
  
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;
  statusFilter = 'all';
  planTypeFilter = 'all';

  constructor(
    private readonly _subscriptionService: SubscriptionService,
    private readonly _dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAllSubscriptions();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Load all subscriptions (both active and inactive)
   */
  loadAllSubscriptions(): void {
    this.loading = true;
    
    this._subscriptionService.getSubscriptions(1, 1000) 
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (data) => {
          this.subscriptions = data.data?.subscriptions ?? [];
          
          this.subscriptions = this.subscriptions.map(sub => ({
            ...sub,
            startDate: this._formatDate(sub.startDate),
            endDate: this._formatDate(sub.endDate),
            status: sub.isActive ? 'active' : 'inactive'
          }));
          
          this.filteredSubscriptions = [...this.subscriptions];
          this.totalItems = this.subscriptions.length;
          this._calculateStats();
          this._updatePagination();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching subscriptions:', error);
          this.loading = false;
        }
      });
  }

  private _formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; 
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; 
    }
  }

  private _calculateStats(): void {
    this.stats.totalSubscriptions = this.subscriptions.length;
    this.stats.activeSubscriptions = this.subscriptions.filter(s => s.isActive === true).length;
    this.stats.inactiveSubscriptions = this.subscriptions.filter(s => s.isActive === false).length;
    this.stats.premiumSubscriptions = this.subscriptions.filter(s => s.type === 'premium').length;
  }

  /**
   * Update pagination based on current filtered data
   */
  private _updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedSubscriptions = this.filteredSubscriptions.slice(startIndex, endIndex);
  }

  onPageChange(event: { page?: number }): void {
    this.currentPage = event.page || 1;
    this._updatePagination();
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  /**
   * Apply all filters (status, plan type, and search)
   */
  applyFilters(): void {
    let filtered = [...this.subscriptions];
    
    if (this.statusFilter !== 'all') {
      if (this.statusFilter === 'active') {
        filtered = filtered.filter(sub => sub.isActive === true);
      } else if (this.statusFilter === 'inactive') {
        filtered = filtered.filter(sub => sub.isActive === false);
      }
    }

    if (this.planTypeFilter !== 'all') {
      filtered = filtered.filter(sub => sub.type === this.planTypeFilter);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(sub => 
        Object.values(sub).some(val => 
          val && val.toString().toLowerCase().includes(term)
        )
      );
    }
    
    this.filteredSubscriptions = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1; 
    this._updatePagination();
  }

  /**
   * Reset all filters and show all subscriptions
   */
  resetFilters(): void {
    this.statusFilter = 'all';
    this.planTypeFilter = 'all';
    this.searchTerm = '';
    this.filteredSubscriptions = [...this.subscriptions];
    this.totalItems = this.subscriptions.length;
    this.currentPage = 1;
    this._updatePagination();
  }

  toggleSubscriptionStatus(subscription: Subscription): void {
    const newStatus = !subscription.isActive;
    
    this._subscriptionService.updateSubscriptionStatus({
      id: subscription.id,
      isActive: newStatus
    })
    .pipe(takeUntil(this._destroy$))
    .subscribe({
      next: () => {
        // Update the subscription in all arrays
        const updateSubscription = (sub: Subscription) => {
          if (sub.id === subscription.id) {
            sub.isActive = newStatus;
            sub.status = newStatus ? 'active' : 'inactive';
          }
          return sub;
        };

        this.subscriptions = this.subscriptions.map(updateSubscription);
        this.filteredSubscriptions = this.filteredSubscriptions.map(updateSubscription);
        
        this._calculateStats();
        this._updatePagination();
      },
      error: (error) => {
        console.error('Error updating subscription status:', error);
      }
    });
  }

  viewSubscriptionDetails(subscription: Subscription): void {
    const dialogRef = this._dialog.open(SubscriptionDetailsDialogComponent, {
      width: '700px',
      data: { subscription }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this._destroy$))
      .subscribe(result => {
        if (result?.updated) {
          result.subscription.startDate = this._formatDate(result.subscription.startDate);
          result.subscription.endDate = this._formatDate(result.subscription.endDate);
          
          const index = this.subscriptions.findIndex(s => s.id === result.subscription.id);
          if (index !== -1) {
            this.subscriptions[index] = result.subscription;
          }

          const filteredIndex = this.filteredSubscriptions.findIndex(s => s.id === result.subscription.id);
          if (filteredIndex !== -1) {
            this.filteredSubscriptions[filteredIndex] = result.subscription;
          }

          this._calculateStats();
          this._updatePagination();
        }
      });
  }
}