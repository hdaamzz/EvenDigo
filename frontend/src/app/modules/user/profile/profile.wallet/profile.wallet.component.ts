import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';

import { WalletService } from '../../../../core/services/user/wallet/wallet.service';
import { Transaction, TransactionTypeStyle } from '../../../../core/interfaces/user/wallet';



@Component({
  selector: 'app-profile-wallet',
  standalone: true,
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
export class ProfileWalletComponent implements OnInit, OnDestroy {
  private readonly _destroy$ = new Subject<void>();
  private readonly _transactionTypeStyles: TransactionTypeStyle = {
    'credit': 'text-green-500',
    'debit': 'text-red-500',
    'refund': 'text-blue-500',
    'withdrawal': 'text-orange-500'
  };

  isInitialLoadComplete = false;
  currentBalance = 0;
  transactions: Transaction[] = [];
  selectedTransaction: Transaction | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  readonly currencySymbol = '₹';
  readonly transactionTypes = ['all', 'credit', 'debit', 'refund', 'withdrawal'];
  selectedType = 'all';

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  constructor(private _walletService: WalletService) {}

  ngOnInit(): void {
    this._loadWalletData();
  }

  ngOnDestroy(): void {
    document.body.style.overflow = 'auto'; // Reset overflow in case component is destroyed with modal open
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _loadWalletData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this._walletService.getWalletDetails()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.currentBalance = response.data.walletBalance;
            this.transactions = response.data.transactions;
            this._calculateTotalPages();
            this.isInitialLoadComplete = true;
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

  private _calculateTotalPages(): void {
    const filteredCount = this._getFilteredTransactions().length;
    this.totalPages = Math.max(1, Math.ceil(filteredCount / this.pageSize));
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  private _getFilteredTransactions(): Transaction[] {
    if (this.selectedType === 'all') return this.transactions;
    return this.transactions.filter(transaction => transaction.type === this.selectedType);
  }

  get filteredTransactions(): Transaction[] {
    const filtered = this._getFilteredTransactions();
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(startIndex, startIndex + this.pageSize);
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
    return this._transactionTypeStyles[transaction.type] || 'text-gray-300';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  onFilterChange(): void {
    this._calculateTotalPages();
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