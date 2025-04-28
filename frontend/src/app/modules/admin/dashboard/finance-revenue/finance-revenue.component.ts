import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatCard } from '../../../../core/models/admin/finance.interfaces';
import { TableColumn } from '../../../../shared/reusable-table/reusable-table.component';

@Component({
  selector: 'app-finance-revenue',
  imports: [CommonModule, FormsModule],
  templateUrl: './finance-revenue.component.html',
  styleUrl: './finance-revenue.component.css'
})
export class FinanceRevenueComponent {
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
    { key: 'endDate', header: 'End Date' },
    { key: 'totalBookings', header: 'Total Bookings' },
    { key: 'totalRevenue', header: 'Total Revenue' },
    { key: 'commission', header: 'Commission' }
  ];

  currentPage: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 5;
}