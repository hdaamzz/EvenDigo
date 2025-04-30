import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from '../../../../../core/models/admin/subscription.interface';
import { SubscriptionService } from '../../../../../core/services/admin/subscription/subscription.service';

@Component({
  selector: 'app-subscription-details-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule,MatIconModule],
  templateUrl: './subscription-details-dialog.component.html',
  styleUrls: ['./subscription-details-dialog.component.scss']
})
export class SubscriptionDetailsDialogComponent {
  subscription: Subscription;
  isEditing: boolean = false;
  isUpdating: boolean = false;
  
  // Format dates for display and editing
  startDateFormatted: string = '';
  endDateFormatted: string = '';
  
  constructor(
    private dialogRef: MatDialogRef<SubscriptionDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: { subscription: Subscription },
    private subscriptionService: SubscriptionService
  ) {
    this.subscription = { ...data.subscription };
    
    // Format dates for the date input fields
    if (this.subscription.startDate) {
      const startDate = new Date(this.subscription.startDate);
      this.startDateFormatted = startDate.toISOString().split('T')[0];
    }
    
    if (this.subscription.endDate) {
      const endDate = new Date(this.subscription.endDate);
      this.endDateFormatted = endDate.toISOString().split('T')[0];
    }
  }
  
  close(): void {
    this.dialogRef.close();
  }
  
  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    
    // Reset to original values if canceling edit
    if (!this.isEditing) {
      this.subscription = { ...this.data.subscription };
      
      // Reset formatted dates
      if (this.subscription.startDate) {
        const startDate = new Date(this.subscription.startDate);
        this.startDateFormatted = startDate.toISOString().split('T')[0];
      }
      
      if (this.subscription.endDate) {
        const endDate = new Date(this.subscription.endDate);
        this.endDateFormatted = endDate.toISOString().split('T')[0];
      }
    }
  }
  
  updateStartDate(event: any): void {
    const newDate = event.target.value;
    this.startDateFormatted = newDate;
    this.subscription.startDate = new Date(newDate).toISOString();
  }
  
  updateEndDate(event: any): void {
    const newDate = event.target.value;
    this.endDateFormatted = newDate;
    this.subscription.endDate = new Date(newDate).toISOString();
  }
  
  toggleSubscriptionStatus(): void {
    this.isUpdating = true;
    const newStatus = !this.subscription.isActive;
    
    this.subscriptionService.updateSubscriptionStatus({
      id: this.subscription.id,
      isActive: newStatus
    }).subscribe({
      next: () => {
        this.subscription.isActive = newStatus;
        this.subscription.status = newStatus ? 'active' : 'inactive';
        this.isUpdating = false;
        
        // Close dialog and pass back updated subscription
        this.dialogRef.close({ updated: true, subscription: this.subscription });
      },
      error: (error) => {
        console.error('Error updating subscription status:', error);
        this.isUpdating = false;
      }
    });
  }
  
  saveChanges(): void {
    this.isUpdating = true;
    
    // Create an update payload with only the fields that changed
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
    
    // Uncomment this in a real application for the API call
    // this.subscriptionService.updateSubscription(updatePayload).subscribe({
    //   next: (response) => {
    //     this.isUpdating = false;
    //     this.isEditing = false;
        
    //     // Close the dialog and pass back the updated subscription
    //     this.dialogRef.close({ updated: true, subscription: this.subscription });
    //   },
    //   error: (error) => {
    //     console.error('Error updating subscription:', error);
    //     this.isUpdating = false;
    //   }
    // });  
  }
  
  formatCurrency(amount: number): string {
    return (amount / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  }
  
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