import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserProfileService } from '../../../../core/services/user/user.profile.service';
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
}
@Component({
  selector: 'app-profile.wallet',
  imports: [CommonModule, FormsModule, HttpClientModule],
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
  // currentBalance: number = 0;
  // transactions: Transaction[] = [];
  // isAddMoneyModalOpen: boolean = false;
  // isWithdrawModalOpen: boolean = false;
  // amountToAdd: number | null = null;
  // amountToWithdraw: number | null = null;
  // predefinedAmounts: number[] = [1000, 2000, 5000, 10000, 20000, 50000];
  // isLoading: boolean = true;
  initialLoadComplete: boolean = false;
  currentBalance: number = 0;
  transactions: Transaction[] = [];

  // Modal states
  isAddMoneyModalOpen = false;
  isWithdrawModalOpen = false;

  // Form values
  amountToAdd: number | null = null;
  amountToWithdraw: number | null = null;

  // UI states
  isLoading = false;
  errorMessage: string | null = null;

  // Constants
  readonly predefinedAmounts = [1000, 2000, 5000, 10000, 20000, 50000];
  readonly currencySymbol = '₹';
  transactionTypes = ['all', 'credit', 'debit', 'refund', 'withdrawal'];
  selectedType = 'all';

  constructor(private walletService: WalletService) { }

  ngOnInit(): void {
    this.loadWalletData();
  }

  private loadWalletData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.walletService.getWalletDetails().subscribe({
      next: (response) => {
        if (response.success) {
          this.currentBalance = response.data.walletBalance;
          this.transactions = response.data.transactions;
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

  openAddMoneyModal(): void {
    this.amountToAdd = null;
    this.isAddMoneyModalOpen = true;
    // Prevent scrolling on the body when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeAddMoneyModal(): void {
    this.isAddMoneyModalOpen = false;
    // Restore scrolling
    document.body.style.overflow = 'auto';
  }

  openWithdrawModal(): void {
    this.amountToWithdraw = null;
    this.isWithdrawModalOpen = true;
    // Prevent scrolling on the body when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeWithdrawModal(): void {
    this.isWithdrawModalOpen = false;
    // Restore scrolling
    document.body.style.overflow = 'auto';
  }

  selectAmount(amount: number): void {
    this.amountToAdd = amount;
  }

  addMoney(): void {
    if (!this.validateAmount(this.amountToAdd)) return;

    this.isLoading = true;
    this.walletService.addMoney(this.amountToAdd!).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadWalletData();
          this.closeAddMoneyModal();
        } else {
          this.errorMessage = response.message || 'Failed to add money';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error adding money:', error);
        this.errorMessage = 'Transaction failed';
        this.isLoading = false;
      }
    });
  }

  withdrawMoney(): void {
    if (!this.validateAmount(this.amountToWithdraw)) return;
    if (this.amountToWithdraw! > this.currentBalance) {
      this.errorMessage = 'Insufficient balance';
      return;
    }

    this.isLoading = true;
    this.walletService.withdrawMoney(this.amountToWithdraw!).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadWalletData();
          this.closeWithdrawModal();
        } else {
          this.errorMessage = response.message || 'Withdrawal failed';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error withdrawing money:', error);
        this.errorMessage = 'Transaction failed';
        this.isLoading = false;
      }
    });
  }
  private validateAmount(amount: number | null): boolean {
    if (!amount || amount <= 0) {
      this.errorMessage = 'Please enter a valid amount';
      return false;
    }
    this.errorMessage = null;
    return true;
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
  get filteredTransactions(): Transaction[] {
    if (this.selectedType === 'all') return this.transactions;
    return this.transactions.filter(t => t.type === this.selectedType);
  }
}
