import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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
export class SubscriptionComponent implements OnInit {
  subscriptions: Subscription[] = [];
  filteredSubscriptions: Subscription[] = [];
  loading: boolean = true;
  
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
  
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalItems: number = 0;
  
  statusFilter: string = 'all';
  planTypeFilter: string = 'all';
  
  constructor(
    private subscriptionService: SubscriptionService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    this.loading = true;
    this.subscriptionService.getSubscriptions().subscribe({
      next: (data) => {
        this.subscriptions = data.data?.subscriptions ?? [];
        
        // Format dates to show only YYYY-MM-DD format
        this.subscriptions = this.subscriptions.map(sub => {
          return {
            ...sub,
            startDate: this.formatDate(sub.startDate),
            endDate: this.formatDate(sub.endDate)
          };
        });
        
        this.filteredSubscriptions = [...this.subscriptions];
        this.totalItems = this.subscriptions.length;
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching subscriptions:', error);
        this.loading = false;
      }
    });
  }

  // Helper method to format dates as YYYY-MM-DD
  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return original string if error occurs
    }
  }

  calculateStats(): void {
    this.stats.totalSubscriptions = this.subscriptions.length;
    this.stats.activeSubscriptions = this.subscriptions.filter(s => s.isActive === true).length;
    this.stats.inactiveSubscriptions = this.subscriptions.filter(s => s.isActive === false).length;
    this.stats.premiumSubscriptions = this.subscriptions.filter(s => s.type === 'premium').length;
  }

  onPageChange(event: any): void {
    this.currentPage = event.page || 1;
  }

  onSearchChange(term: string): void {
    this.applyFilters(term);
  }

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

  resetFilters(): void {
    this.statusFilter = 'all';
    this.planTypeFilter = 'all';
    this.filteredSubscriptions = [...this.subscriptions];
    this.totalItems = this.subscriptions.length;
    this.currentPage = 1;
  }

  toggleSubscriptionStatus(subscription: any): void {
    const newStatus = !subscription.isActive;
    this.subscriptionService.updateSubscriptionStatus({
      id: subscription.id,
      isActive: newStatus
    }).subscribe({
      next: () => {
        subscription.isActive = newStatus;
        subscription.status = newStatus ? 'active' : 'inactive';
        this.calculateStats();
      },
      error: (error) => {
        console.error('Error updating subscription status:', error);
      }
    });
  }

  viewSubscriptionDetails(subscription: any): void {
    const dialogRef = this.dialog.open(SubscriptionDetailsDialogComponent, {
      width: '700px',
      data: { subscription }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.updated) {
        // Find the subscription in our arrays and update it
        const index = this.subscriptions.findIndex(s => s.id === result.subscription.id);
        if (index !== -1) {
          // Format the dates if they've been changed
          result.subscription.startDate = this.formatDate(result.subscription.startDate);
          result.subscription.endDate = this.formatDate(result.subscription.endDate);
          
          this.subscriptions[index] = result.subscription;
        }

        const filteredIndex = this.filteredSubscriptions.findIndex(s => s.id === result.subscription.id);
        if (filteredIndex !== -1) {
          this.filteredSubscriptions[filteredIndex] = result.subscription;
        }

        // Recalculate stats
        this.calculateStats();
      }
    });
  }
}