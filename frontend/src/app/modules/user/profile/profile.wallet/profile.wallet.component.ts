import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';
import { WalletService } from '../../../../core/services/user/wallet/wallet.service';

interface Transaction {
  date: Date;
  eventName: string;
  eventId: string;
  transactionId: string;
  amount: number;
  type: 'credit' | 'debit' | 'refund' | 'withdrawal';
  balance: number;
  status?: 'pending' | 'completed' | 'failed';
  description?: string;
  metadata?: any;
}

@Component({
  selector: 'app-profile.wallet',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.wallet.component.html',
  styleUrl: './profile.wallet.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
      ])
    ])
  ]
})
export class ProfileWalletComponent implements OnInit {

  initialLoadComplete: boolean = false;
  currentBalance: number = 0;
  transactions: Transaction[] = [];

  selectedTransaction: Transaction | null = null;

  isLoading = false;
  errorMessage: string | null = null;

  readonly currencySymbol = '₹';
  transactionTypes = ['all', 'credit', 'debit', 'refund', 'withdrawal'];
  selectedType = 'all';

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  constructor(private walletService: WalletService) { }

  ngOnInit(): void {
    this.loadWalletData();
  }

  private loadWalletData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.walletService.getWalletDetails().subscribe({
      next: (response) => {
        console.log(response);
        
        if (response.success) {
          this.currentBalance = response.data.walletBalance;
          this.transactions = response.data.transactions;
          this.calculateTotalPages();
          this.initialLoadComplete = true;
        } else {
          this.errorMessage = response.message || 'Failed to load wallet data';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading wallet:', error);
        this.errorMessage = 'Failed to connect to server';
        this.isLoading = false;
      }
    });
  }

  private calculateTotalPages(): void {
    const filteredCount = this.getFilteredTransactions().length;
    this.totalPages = Math.max(1, Math.ceil(filteredCount / this.pageSize));
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  openTransactionDetails(transaction: Transaction): void {
    this.selectedTransaction = transaction;
    document.body.style.overflow = 'hidden';
  }

  closeTransactionDetails(): void {
    this.selectedTransaction = null;
    document.body.style.overflow = 'auto';
  }

  getAmountClass(amount: number): string {
    return amount >= 0 ? 'text-[#00ff66]' : 'text-red-500';
  }

  formatAmount(amount: number): string {
    const absAmount = Math.abs(amount);
    const prefix = amount >= 0 ? '+' : '-';
    return `${prefix}${this.currencySymbol}${absAmount.toLocaleString('en-IN')}`;
  }

  getTransactionClass(transaction: Transaction): string {
    return {
      'credit': 'text-green-500',
      'debit': 'text-red-500',
      'refund': 'text-blue-500',
      'withdrawal': 'text-orange-500'
    }[transaction.type] || 'text-gray-300';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  private getFilteredTransactions(): Transaction[] {
    if (this.selectedType === 'all') return this.transactions;
    return this.transactions.filter(t => t.type === this.selectedType);
  }

  get filteredTransactions(): Transaction[] {
    const filtered = this.getFilteredTransactions();
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(startIndex, startIndex + this.pageSize);
  }

  onFilterChange(): void {
    this.calculateTotalPages();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    
    if (this.totalPages <= maxPages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
      let endPage = startPage + maxPages - 1;
      
      if (endPage > this.totalPages) {
        endPage = this.totalPages;
        startPage = Math.max(1, endPage - maxPages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  getMetadataKeys(transaction: Transaction): string[] {
    return transaction.metadata ? Object.keys(transaction.metadata) : [];
  }

  formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }
}