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
  isMobile = false;
  showAllPages = false;

  readonly currencySymbol = '₹';
  readonly transactionTypes = ['all', 'credit', 'debit', 'refund'];
  selectedType = 'all';

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  constructor(private _walletService: WalletService) { }

  ngOnInit(): void {
  this._checkMobileView();
  this._loadWalletData();
}
private _checkMobileView(): void {
  this.isMobile = window.innerWidth < 768;
  
  // Listen for window resize
  window.addEventListener('resize', () => {
    this.isMobile = window.innerWidth < 768;
  });
}

  ngOnDestroy(): void {
    document.body.style.overflow = 'auto';
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

  changeFilter(type: string): void {
    if (this.selectedType !== type) {
      this.selectedType = type;
      this.onFilterChange();
    }
  }
  getFilterButtonClass(type: string): string {
    return this.selectedType === type
      ? 'bg-[#00ff66] text-black font-medium'
      : 'bg-[#262626] text-gray-300 hover:bg-[#333333] hover:text-white';
  }
  trackByType(index: number, type: string): string {
    return type;
  }

  trackByTransaction(index: number, transaction: Transaction): string {
    return transaction.transactionId;
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
  
  if (this.isMobile) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}



  getAmountClass(amount: number): string {
    return amount >= 0 ? 'text-[#00ff66]' : 'text-red-500';
  }

  formatAmount(amount: number): string {
  const absAmount = Math.abs(amount);
  const prefix = amount >= 0 ? '+' : '-';
  
  // Use shorter format on mobile for very large numbers
  if (this.isMobile && absAmount >= 100000) {
    const formatted = (absAmount / 100000).toFixed(1);
    return `${prefix}${this.currencySymbol}${formatted}L`;
  }
  
  return `${prefix}${this.currencySymbol}${absAmount.toLocaleString('en-IN')}`;
}
getTruncatedDescription(description: string, maxLength: number = 30): string {
  if (!description) return '';
  
  if (this.isMobile && description.length > maxLength) {
    return description.substring(0, maxLength) + '...';
  }
  
  return description;
}
onMobileCardClick(transaction: Transaction): void {
  // Add haptic feedback for mobile
  if (this.isMobile && 'vibrate' in navigator) {
    navigator.vibrate(50);
  }
  this.openTransactionDetails(transaction);
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
    this.currentPage = 1;
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
  const maxVisiblePages = this.isMobile ? 3 : 5; // Show fewer pages on mobile

  if (this.totalPages <= maxVisiblePages) {
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (this.isMobile && !this.showAllPages) {
      // For mobile, show current page and adjacent pages
      let startPage = Math.max(1, this.currentPage - 1);
      let endPage = Math.min(this.totalPages, this.currentPage + 1);
      
      // Ensure we always show 3 pages if possible
      if (endPage - startPage + 1 < 3) {
        if (startPage === 1) {
          endPage = Math.min(this.totalPages, 3);
        } else if (endPage === this.totalPages) {
          startPage = Math.max(1, this.totalPages - 2);
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    } else {
      // Desktop or show all pages
      let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
  }

  return pages;
}
togglePageView(): void {
  this.showAllPages = !this.showAllPages;
}
getResponsivePageSize(): number {
  return this.isMobile ? 3 : this.pageSize;
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