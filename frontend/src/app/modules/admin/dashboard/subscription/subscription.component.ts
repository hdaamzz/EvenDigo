import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReusableTableComponent, TableColumn } from '../../../../shared/reusable-table/reusable-table.component';
import { SubscriptionService } from '../../../../core/services/admin/subscription/subscription.service';
import { Subscription } from '../../../../core/models/admin/subscription.interface';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule, ReusableTableComponent],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.css'
})
export class SubscriptionComponent implements OnInit {
  subscriptions: Subscription[] = [];
  filteredSubscriptions: any[] = [];
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
  
  constructor(private subscriptionService: SubscriptionService) { }

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    this.loading = true;
    this.subscriptionService.getSubscriptions().subscribe({
      next: (data) => {
        this.subscriptions = data.data?.subscriptions ?? [];
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
    console.log('View subscription details:', subscription);
  }
}