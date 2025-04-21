import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { AdminCouponService } from '../../../../core/services/admin/admin-coupon.service';
import { alphabetsValidator, onlyNumbersValidator, futureDateValidator } from '../../../../validators/formValidators';
import Notiflix from 'notiflix';
import { ICoupon } from '../../../../core/models/admin/coupon.interfacce';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil, debounceTime, filter } from 'rxjs/operators';

@Component({
  selector: 'app-coupon-list',
  standalone: true,
  imports: [
    DialogModule, ButtonModule, MenuModule, CommonModule, SelectModule,
    InputTextModule, FormsModule, ReactiveFormsModule,DatePickerModule
  ],
  templateUrl: './coupon-list.component.html',
  styleUrls: ['./coupon-list.component.css']
})
export class CouponListComponent implements OnInit, OnDestroy, AfterViewInit {
  couponsList: any[] = [];
  loading = false;
  couponDialogVisible = false;
  selectedCoupon: any = {};
  isMobile = window.innerWidth < 768;
  createDialogVisible = false;
  
  // Pagination variables
  currentPage = 1;
  pageSize = 9; 
  hasMoreCoupons = true;
  allLoaded = false;
  
  
  private destroy$ = new Subject<void>();
  
  // For scroll detection
  @ViewChild('couponsContainer') couponsContainer: ElementRef | undefined;  
  couponForm: FormGroup;
  discountTypes = [
    { label: 'Percentage', value: 'percentage' },
    { label: 'Fixed Amount', value: 'fixed_amount' }
  ];

  constructor(
    private fb: FormBuilder,
    private couponService: AdminCouponService
  ) {
    // Initialize coupon form with validations
    this.couponForm = this.fb.group({
      couponCode: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), alphabetsValidator()]],
      discountType: ['', Validators.required],
      discount: [null, [Validators.required, Validators.min(1), onlyNumbersValidator()]],
      minAmount: [0, [Validators.min(0), onlyNumbersValidator()]],
      maxUses: [null, [Validators.min(0), onlyNumbersValidator()]],
      expiryDate: [null, [Validators.required,futureDateValidator()]],
      description: ['', [Validators.maxLength(500)]]
    }, { validators: this.customValidators() });
  }
  
  ngOnInit() {
    this.loadCoupons(true);
    
    // Handle window resize for mobile detection
    fromEvent(window, 'resize')
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(200)
      )
      .subscribe(() => {
        this.isMobile = window.innerWidth < 768;
      });

      
  }
  
  ngAfterViewInit() {
    fromEvent(window, 'scroll')
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(200),
        filter(() => !this.loading && this.hasMoreCoupons)
      )
      .subscribe(() => {
        if (this.isScrolledToBottom()) {
          this.loadMoreCoupons();
        }
      });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  isScrolledToBottom(): boolean {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    return (scrollPosition + windowHeight) > (documentHeight * 0.8);
  }

  // Load coupons with pagination
  loadCoupons(reset: boolean = false) {
    if (reset) {
      this.currentPage = 1;
      this.couponsList = [];
      this.hasMoreCoupons = true;
      this.allLoaded = false;
    }
    
    if (this.loading || this.allLoaded) return;
    
    this.loading = true;
    this.couponService.getCouponsWithPagination(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        const newCoupons = response.data.map(coupon => ({
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
        
        this.couponsList = reset ? newCoupons : [...this.couponsList, ...newCoupons];
        
        this.hasMoreCoupons = response.pagination?.hasMore || false;
        if (!this.hasMoreCoupons) {
          this.allLoaded = true;
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading coupons:', err);
        this.loading = false;
      }
    });
  }
  
  loadMoreCoupons() {
    if (this.loading || !this.hasMoreCoupons) return;
    
    this.currentPage++;
    this.loadCoupons();
  }

  showCouponDetails(couponId: string) {
    this.selectedCoupon = this.couponsList.find(coupon => coupon._id === couponId);
    this.couponDialogVisible = true;
  }

  hideCouponDialog() {
    this.couponDialogVisible = false;
  }

  addNewCoupon() {
    this.selectedCoupon = {};
    this.couponForm.reset();
    this.couponForm.patchValue({ minAmount: 0, maxUses: null });
    this.couponForm.markAsPristine();
    this.couponForm.markAsUntouched();
    this.createDialogVisible = true;
  }

  saveCoupon() {
    if (this.couponForm.invalid) {
      this.couponForm.markAllAsTouched();
      
      const firstInvalidControl = document.querySelector('.ng-invalid');
      if (firstInvalidControl) {
        firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return;
    }
  
    const couponData: ICoupon = {
      couponCode: (this.couponForm.value.couponCode || '').toUpperCase(),
      discountType: this.couponForm.value.discountType,
      discount: parseFloat(this.couponForm.value.discount),
      minAmount: parseFloat(this.couponForm.value.minAmount || 0),
      maxUses: this.couponForm.value.maxUses !== null ? parseInt(this.couponForm.value.maxUses, 10) : null,
      expiryDate: this.couponForm.value.expiryDate,
      description: this.couponForm.value.description || '',
    };

    if (this.selectedCoupon._id) {
      // Update existing coupon
      this.couponService.updateCoupon(this.selectedCoupon._id, couponData).subscribe({
        next: () => {
          this.loadCoupons(true); 
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
          this.loadCoupons(true); // Reload from first page
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
      next: () => {
        const coupon = this.couponsList.find(c => c._id === couponId);
        if (coupon) {
          coupon.status = 'active';
        }
        Notiflix.Notify.success('Coupon activated successfully');
      },
      error: (err) => {
        console.error('Error activating coupon:', err);
        Notiflix.Notify.failure('Failed to activate coupon');
      }
    });
  }

  // Deactivate coupon
  deactivateCoupon(couponId: string) {
    this.couponService.deactivateCoupon(couponId).subscribe({
      next: () => {
        const coupon = this.couponsList.find(c => c._id === couponId);
        if (coupon) {
          coupon.status = 'inactive';
        }
        Notiflix.Notify.success('Coupon deactivated successfully');
      },
      error: (err) => {
        console.error('Error deactivating coupon:', err);
        Notiflix.Notify.failure('Failed to deactivate coupon');
      }
    });
  }

  // Delete coupon
  deleteCoupon(couponId: string) {
    Notiflix.Confirm.show(
      'Confirm Deletion', 
      'Are you sure you want to delete this coupon?',
      'Yes', 
      'No', 
      () => {
        this.couponService.deleteCoupon(couponId).subscribe({
          next: () => {
            this.couponsList = this.couponsList.filter(coupon => coupon._id !== couponId);
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

  //costom validaton method 
  customValidators(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const discountType = formGroup.get('discountType')?.value;
      const discount = formGroup.get('discount')?.value;
      const minAmount = formGroup.get('minAmount')?.value;
      const errors: ValidationErrors = {};
      
      if (discountType === 'percentage' && discount > 80) {
        formGroup.get('discount')?.setErrors({ maxPercentage: true });
        errors['maxPercentage'] = true;
      }
      
      if (discountType === 'fixed_amount' && minAmount > 0 && discount > minAmount) {
        formGroup.get('discount')?.setErrors({ exceedsMinAmount: true });
        errors['exceedsMinAmount'] = true;
      }
  
      return Object.keys(errors).length > 0 ? errors : null;
    };
  }
}