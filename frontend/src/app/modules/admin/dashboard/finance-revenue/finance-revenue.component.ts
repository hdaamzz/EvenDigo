import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReusableTableComponent, TableColumn } from '../../../../shared/reusable-table/reusable-table.component';

interface Transaction {
  eventName: string;
  organizer: string;
  date: string;
  ticketType: string;
  amount: string;
  status: string;
}

interface StatCard {
  title: string;
  value: string;
  change: string;
  isNegative: boolean;
}

@Component({
  selector: 'app-finance-revenue',
  imports: [CommonModule, FormsModule, ReusableTableComponent],
  templateUrl: './finance-revenue.component.html',
  styleUrl: './finance-revenue.component.css'
})
export class FinanceRevenueComponent implements OnInit {
  statCards: StatCard[] = [
    {
      title: 'Total Revenue',
      value: '284,592.50',
      change: '12.5% vs last month',
      isNegative: false
    },
    {
      title: 'Today\'s Revenue',
      value: '4,892.00',
      change: '8.2% vs yesterday',
      isNegative: false
    },
    {
      title: 'This Month',
      value: '86,245.75',
      change: '3.1% vs last month',
      isNegative: true
    }
  ];
  
  tableColumns: TableColumn[] = [
    { key: 'eventName', header: 'Event Name' },
    { key: 'organizer', header: 'Organizer' },
    { key: 'date', header: 'Date' },
    { 
      key: 'ticketType', 
      header: 'Ticket Type', 
      type: 'badge',
      badgeMapping: {
        'VIP': { color: 'orange', bgColor: 'orange-100' },
        'Regular': { color: 'blue', bgColor: 'blue-100' },
        'Gold': { color: 'yellow', bgColor: 'yellow-100' }
      }
    },
    { key: 'amount', header: 'Amount', type: 'amount' },
    { key: 'status', header: 'Status' }
  ];
  
  transactions: Transaction[] = [
    
    {
      eventName: 'Tech Conference 2024',
      organizer: 'Michael Smith',
      date: '15 Feb 2024',
      ticketType: 'VIP',
      amount: '+1,499.99',
      status: 'Completed'
    },{
      eventName: 'Tech Conference 2024',
      organizer: 'Michael Smith',
      date: '15 Feb 2024',
      ticketType: 'VIP',
      amount: '+1,499.99',
      status: 'Completed'
    },
    {
      eventName: 'Digital Marketing Workshop',
      organizer: 'Sarah Johnson',
      date: '14 Feb 2024',
      ticketType: 'Regular',
      amount: '+299.99',
      status: 'Completed'
    },
    {
      eventName: 'Business Summit 2024',
      organizer: 'David Wilson',
      date: '14 Feb 2024',
      ticketType: 'Gold',
      amount: '+899.99',
      status: 'Completed'
    },
    {
      eventName: 'Leadership Seminar',
      organizer: 'Emily Brown',
      date: '13 Feb 2024',
      ticketType: 'VIP',
      amount: '+799.99',
      status: 'Completed'
    },
    {
      eventName: 'Startup Networking Event',
      organizer: 'Alex Chen',
      date: '13 Feb 2024',
      ticketType: 'Regular',
      amount: '+199.99',
      status: 'Completed'
    },
    {
      eventName: 'Tech Conference 2024',
      organizer: 'Michael Smith',
      date: '15 Feb 2024',
      ticketType: 'VIP',
      amount: '+1,499.99',
      status: 'Completed'
    },
    {
      eventName: 'Digital Marketing Workshop',
      organizer: 'Sarah Johnson',
      date: '14 Feb 2024',
      ticketType: 'Regular',
      amount: '+299.99',
      status: 'Completed'
    },
    {
      eventName: 'Business Summit 2024',
      organizer: 'David Wilson',
      date: '14 Feb 2024',
      ticketType: 'Gold',
      amount: '+899.99',
      status: 'Completed'
    },
    {
      eventName: 'Leadership Seminar',
      organizer: 'Emily Brown',
      date: '13 Feb 2024',
      ticketType: 'VIP',
      amount: '+799.99',
      status: 'Completed'
    },
    {
      eventName: 'Startup Networking Event',
      organizer: 'Alex Chen',
      date: '13 Feb 2024',
      ticketType: 'Regular',
      amount: '+199.99',
      status: 'Completed'
    }
  ];
  
  ngOnInit(): void {
  }
  
  onPageChange(event: any): void {
    console.log('Page changed:', event);
  }
  
  onSearchChange(searchTerm: string): void {
    console.log('Search term:', searchTerm);
  }
}
