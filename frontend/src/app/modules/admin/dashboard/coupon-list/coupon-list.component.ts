// src/app/components/coupon-list/coupon-list.component.ts
import { Component, OnInit } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { AdminCouponService } from '../../../../core/services/admin/admin-coupon.service';
import { alphabetsValidator, onlyNumbersValidator, futureDateValidator } from '../../../../validators/formValidators';
import Notiflix from 'notiflix';

@Component({
  selector: 'app-coupon-list',
  standalone: true,
  imports: [
    DialogModule, ButtonModule, MenuModule, CommonModule, CalendarModule,
    InputTextModule, FormsModule, ReactiveFormsModule, DropdownModule
  ],
  templateUrl: './coupon-list.component.html',
  styleUrls: ['./coupon-list.component.css']
})
export class CouponListComponent implements OnInit {
  couponsList: any[] = [];
  loading = false;
  couponDialogVisible = false;
  selectedCoupon: any = {};
  isMobile = window.innerWidth < 768;
  createDialogVisible = false;
  // Form for Add/Edit Coupon
  couponForm: FormGroup;
  discountTypes = [
    { label: 'Percentage', value: 'percentage' },
    { label: 'Fixed Amount', value: 'fixed_amount' } // Matches backend enum
  ];

  constructor(
    private fb: FormBuilder,
    private couponService: AdminCouponService
  ) {
    // Initialize the coupon form with validations
    this.couponForm = this.fb.group({
      couponCode: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), alphabetsValidator()]],
      discountType: ['', Validators.required],
      discount: [null, [Validators.required, Validators.min(1), onlyNumbersValidator()]],
      minAmount: [null, [Validators.min(0), onlyNumbersValidator()]],
      maxUses: [null, [Validators.min(0), onlyNumbersValidator()]],
      expiryDate: [null, [futureDateValidator()]],
      description: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit() {
    this.loadCoupons();
  }

  // Load all coupons from backend
  loadCoupons() {
    this.loading = true;
    this.couponService.getCoupons().subscribe({
      next: (coupons) => {
        this.couponsList = coupons.map(coupon => ({
          _id: coupon._id,
          code: coupon.couponCode,
          description: coupon.description,
          discount: coupon.discount,
          discountType: coupon.discountType,
          minAmount: coupon.minAmount || 0,
          maxUses: coupon.maxUses || 'Unlimited',
          usageCount: coupon.currentUses || 0,
          expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate) : null,
          status: coupon.isActive ? 'active' : 'inactive'
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading coupons:', err);
        this.loading = false;
      }
    });
  }

  // Show coupon details
  showCouponDetails(couponId: string) {
    this.selectedCoupon = this.couponsList.find(coupon => coupon._id === couponId);
    this.couponDialogVisible = true;
  }

  hideCouponDialog() {
    this.couponDialogVisible = false;
  }

  // Add new coupon
  addNewCoupon() {
    this.couponForm.reset();
    this.couponForm.patchValue({ minAmount: 0, maxUses: null }); // Default values
    this.couponForm.markAsPristine();
    this.couponForm.markAsUntouched();
    this.createDialogVisible = true;
  }

  // Create or update coupon
  saveCoupon() {
    if (this.couponForm.invalid) {
      this.couponForm.markAllAsTouched();
      return;
    }

    const couponData = {
      couponCode: this.couponForm.value.couponCode.toUpperCase(),
      discountType: this.couponForm.value.discountType,
      discount: this.couponForm.value.discount,
      minAmount: this.couponForm.value.minAmount,
      maxUses: this.couponForm.value.maxUses,
      expiryDate: this.couponForm.value.expiryDate,
      description: this.couponForm.value.description
    };

    if (this.selectedCoupon._id) {
      // Update existing coupon
      this.couponService.updateCoupon(this.selectedCoupon._id, couponData).subscribe({
        next: () => {
          this.loadCoupons();
          Notiflix.Notify.success('Coupon Updated Successfully')
          this.couponDialogVisible = false;
          this.createDialogVisible = false
        },
        error: (err) => {
          console.error('Error updating coupon:', err);
          Notiflix.Notify.failure('Failed to update coupon: ' + (err.message || 'Unknown error')); // Error notification
        }
      });
    } else {
      // Create new coupon
      this.couponService.createCoupon(couponData).subscribe({
        next: () => {
          this.loadCoupons();
          Notiflix.Notify.success('Coupon Created Successfully')
          this.createDialogVisible = false;
        },
        error: (err) => {
          console.error('Error creating coupon:', err);
          Notiflix.Notify.failure('Failed to create coupon: ' + (err.message || 'Unknown error')); // Error notification
        }
      });
    }
  }

  // Edit coupon
  editCoupon(couponId: string) {
    this.selectedCoupon = this.couponsList.find(coupon => coupon._id === couponId);
    this.couponForm.patchValue({
      couponCode: this.selectedCoupon.code,
      discountType: this.selectedCoupon.discountType,
      discount: this.selectedCoupon.discount,
      minAmount: this.selectedCoupon.minAmount,
      maxUses: this.selectedCoupon.maxUses === 'Unlimited' ? null : this.selectedCoupon.maxUses,
      expiryDate: this.selectedCoupon.expiryDate,
      description: this.selectedCoupon.description
    });
    this.createDialogVisible = true;
  }

  // Activate coupon
  activateCoupon(couponId: string) {
    this.couponService.activateCoupon(couponId).subscribe({
      next: () => this.loadCoupons(),
      error: (err) => console.error('Error activating coupon:', err)
    });
  }

  // Deactivate coupon
  deactivateCoupon(couponId: string) {
    this.couponService.deactivateCoupon(couponId).subscribe({
      next: () => this.loadCoupons(),
      error: (err) => console.error('Error deactivating coupon:', err)
    });
  }

  // Delete coupon
  deleteCoupon(couponId: string) {
    Notiflix.Confirm.show(
      'Confirm Deletion', 
      'Are you sure you want to delete this coupon?',
      'Yes', 
      'No', 
      () => {+
        this.couponService.deleteCoupon(couponId).subscribe({
          next: () => {
            this.loadCoupons();
            Notiflix.Notify.success('Coupon deleted successfully');
          },
          error: (err) => {
            console.error('Error deleting coupon:', err);
            Notiflix.Notify.failure('Failed to delete coupon');
          }
        });
      },
      () => {
        console.log('Deletion cancelled');
      },
      {
        width: '320px',
        borderRadius: '8px',
        titleColor: '#ff5549',
        okButtonBackground: '#ff5549',
        cancelButtonBackground: '#a9a9a9'
      }
    );
  }
}