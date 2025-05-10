import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ReusableTableComponent, TableColumn } from '../../../../shared/reusable-table/reusable-table.component';
import { SubscriptionService } from '../../../../core/services/admin/subscription/subscription.service';
import { Subscription } from '../../../../core/models/admin/subscription.interface';
import { SubscriptionDetailsDialogComponent } from './subscription-details-dialog/subscription-details-dialog.component';

/**
 * Component for managing user subscriptions
 * Displays subscription data in a table with filtering and pagination
 */
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
  loading = true;
  private readonly _destroy$ = new Subject<void>();
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
  
  /**
   * @param _subscriptionService Service for subscription-related API calls
   * @param _dialog Material dialog service for displaying subscription details
   */
  constructor(
    private readonly _subscriptionService: SubscriptionService,
    private readonly _dialog: MatDialog
  ) {}

  /** Initialize component and load subscription data */
  ngOnInit(): void {
    this.loadSubscriptions();
  }

  /** Clean up subscriptions when component is destroyed */
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Loads subscription data from the API
   */
  loadSubscriptions(): void {
    this.loading = true;
    
    this._subscriptionService.getSubscriptions()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (data) => {
          this.subscriptions = data.data?.subscriptions ?? [];
          
          this.subscriptions = this.subscriptions.map(sub => ({
            ...sub,
            startDate: this._formatDate(sub.startDate),
            endDate: this._formatDate(sub.endDate)
          }));
          
          this.filteredSubscriptions = [...this.subscriptions];
          this.totalItems = this.subscriptions.length;
          this._calculateStats();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching subscriptions:', error);
          this.loading = false;
        }
      });
  }

  /**
   * Formats date string to YYYY-MM-DD format
   * @param dateString Date string to format
   * @returns Formatted date string
   */
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

  /**
   * Calculates subscription statistics
   */
  private _calculateStats(): void {
    this.stats.totalSubscriptions = this.subscriptions.length;
    this.stats.activeSubscriptions = this.subscriptions.filter(s => s.isActive === true).length;
    this.stats.inactiveSubscriptions = this.subscriptions.filter(s => s.isActive === false).length;
    this.stats.premiumSubscriptions = this.subscriptions.filter(s => s.type === 'premium').length;
  }

  /**
   * Handles page change events from the table component
   * @param event Page change event containing page number
   */
  onPageChange(event: { page?: number }): void {
    this.currentPage = event.page || 1;
  }

  /**
   * Handles search term changes
   * @param term Search term
   */
  onSearchChange(term: string): void {
    this.applyFilters(term);
  }

  /**
   * Applies filters to the subscription data
   * @param searchTerm Optional search term
   */
  applyFilters(searchTerm: string = ''): void {
    let filtered = [...this.subscriptions];
    
    if (this.statusFilter !== 'all') {
      const isActive = this.statusFilter === 'active';
      filtered = filtered.filter(sub => sub.isActive === isActive);
    }
    
    if (this.planTypeFilter !== 'all') {
      filtered = filtered.filter(sub => sub.type === this.planTypeFilter);
    }
 
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sub => 
        Object.values(sub).some(val => 
          val && val.toString().toLowerCase().includes(term)
        )
      );
    }
    
    this.filteredSubscriptions = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1;
  }

  /**
   * Resets all applied filters
   */
  resetFilters(): void {
    this.statusFilter = 'all';
    this.planTypeFilter = 'all';
    this.filteredSubscriptions = [...this.subscriptions];
    this.totalItems = this.subscriptions.length;
    this.currentPage = 1;
  }

  /**
   * Toggles the active status of a subscription
   * @param subscription Subscription to update
   */
  toggleSubscriptionStatus(subscription: Subscription): void {
    const newStatus = !subscription.isActive;
    
    this._subscriptionService.updateSubscriptionStatus({
      id: subscription.id,
      isActive: newStatus
    })
    .pipe(takeUntil(this._destroy$))
    .subscribe({
      next: () => {
        subscription.isActive = newStatus;
        subscription.status = newStatus ? 'active' : 'inactive';
        this._calculateStats();
      },
      error: (error) => {
        console.error('Error updating subscription status:', error);
      }
    });
  }

  /**
   * Opens a dialog to view detailed subscription information
   * @param subscription Subscription to view
   */
  viewSubscriptionDetails(subscription: Subscription): void {
    const dialogRef = this._dialog.open(SubscriptionDetailsDialogComponent, {
      width: '700px',
      data: { subscription }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this._destroy$))
      .subscribe(result => {
        if (result?.updated) {
          const index = this.subscriptions.findIndex(s => s.id === result.subscription.id);
          if (index !== -1) {
            result.subscription.startDate = this._formatDate(result.subscription.startDate);
            result.subscription.endDate = this._formatDate(result.subscription.endDate);
            
            this.subscriptions[index] = result.subscription;
          }

          const filteredIndex = this.filteredSubscriptions.findIndex(s => s.id === result.subscription.id);
          if (filteredIndex !== -1) {
            this.filteredSubscriptions[filteredIndex] = result.subscription;
          }

          this._calculateStats();
        }
      });
  }
}