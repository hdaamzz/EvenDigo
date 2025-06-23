import { Component, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';

import { Subscription } from '../../../../../core/models/admin/subscription.interface';
import { SubscriptionService } from '../../../../../core/services/admin/subscription/subscription.service';


@Component({
  selector: 'app-subscription-details-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './subscription-details-dialog.component.html',
  styleUrls: ['./subscription-details-dialog.component.scss']
})
export class SubscriptionDetailsDialogComponent implements OnDestroy {
  subscription: Subscription;
  isEditing = false;
  isUpdating = false;
  private readonly _destroy$ = new Subject<void>();
  startDateFormatted = '';
  endDateFormatted = '';

  constructor(
    private readonly _dialogRef: MatDialogRef<SubscriptionDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private readonly _data: { subscription: Subscription },
    private readonly _subscriptionService: SubscriptionService
  ) {
    this.subscription = { ...this._data.subscription };
    this._initFormattedDates();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
  

  private _initFormattedDates(): void {
    if (this.subscription.startDate) {
      const startDate = new Date(this.subscription.startDate);
      this.startDateFormatted = startDate.toISOString().split('T')[0];
    }
    
    if (this.subscription.endDate) {
      const endDate = new Date(this.subscription.endDate);
      this.endDateFormatted = endDate.toISOString().split('T')[0];
    }
  }
  
  /**
   * Closes the dialog
   */
  close(): void {
    this._dialogRef.close();
  }
  
  /**
   * Toggles edit mode and resets values when leaving edit mode
   */
  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    
    if (!this.isEditing) {
      this.subscription = { ...this._data.subscription };
      this._initFormattedDates();
    }
  }
  
  /**
   * Updates the start date when the input changes
   * @param event Input change event
   */
  updateStartDate(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newDate = target.value;
    this.startDateFormatted = newDate;
    this.subscription.startDate = new Date(newDate).toISOString();
  }
  
  /**
   * Updates the end date when the input changes
   * @param event Input change event
   */
  updateEndDate(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newDate = target.value;
    this.endDateFormatted = newDate;
    this.subscription.endDate = new Date(newDate).toISOString();
  }
  
  /**
   * Toggles the active status of the subscription
   */
  toggleSubscriptionStatus(): void {
    this.isUpdating = true;
    const newStatus = !this.subscription.isActive;
    
    this._subscriptionService.updateSubscriptionStatus({
      id: this.subscription.id,
      isActive: newStatus
    })
    .pipe(takeUntil(this._destroy$))
    .subscribe({
      next: () => {
        this.subscription.isActive = newStatus;
        this.subscription.status = newStatus ? 'active' : 'inactive';
        this.isUpdating = false;
        
        this._dialogRef.close({ updated: true, subscription: this.subscription });
      },
      error: (error) => {
        console.error('Error updating subscription status:', error);
        this.isUpdating = false;
      }
    });
  }
  
  /**
   * Saves changes to the subscription
   * Note: API call is commented out as in the original code
   */
  saveChanges(): void {
    this.isUpdating = true;
    
    const updatePayload = {
      id: this.subscription.id,
      type: this.subscription.type,
      amount: this.subscription.amount,
      paymentMethod: this.subscription.paymentMethod,
      status: this.subscription.status,
      startDate: this.subscription.startDate,
      endDate: this.subscription.endDate,
      stripeCustomerId: this.subscription.stripeCustomerId,
      stripeSubscriptionId: this.subscription.stripeSubscriptionId
    };
    
    setTimeout(() => {
      this.isUpdating = false;
      this.isEditing = false;
      this._dialogRef.close({ updated: true, subscription: this.subscription });
    }, 500);
  }
  
  /**
   * Formats an amount as USD currency
   * @param amount Amount in cents
   * @returns Formatted currency string
   */
  formatCurrency(amount: number): string {
    return (amount / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  }
  
  /**
   * Formats a date string into a human-readable format
   * @param dateString ISO date string
   * @returns Formatted date string
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}