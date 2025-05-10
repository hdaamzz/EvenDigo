import { Component, OnDestroy } from '@angular/core';
import { UserNavComponent } from "../../../shared/user-nav/user-nav.component";
import { UserFooterComponent } from "../../../shared/user-footer/user-footer.component";
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { 
  alphabetsValidator, 
  emailValidator, 
  mobileNumberValidator, 
  spacesValidator,
  onlyNumbersValidator,
  passwordMatchValidator,
  passwordValidator,
  repeateCharacterValidator 
} from '../../../validators/formValidators';
import Notiflix from 'notiflix';  
import { AuthService } from '../../../core/services/user/auth/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [UserNavComponent, UserFooterComponent, CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnDestroy {
  private readonly _destroy$ = new Subject<void>();
  registerForm!: FormGroup;
  otpForm!: FormGroup;
  isFormSubmited: boolean = false;
  showOtpForm: boolean = false;
  loading: boolean = false;
  resendOtpTimer: number = 60;
  private _resendOtpInterval: any;

  constructor(
    private _fb: FormBuilder,
    private _authService: AuthService,
    private _router: Router,
  ) {
    this._initializeForms();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    
    if (this._resendOtpInterval) {
      clearInterval(this._resendOtpInterval);
    }
  }
  
  private _initializeForms(): void {
    this.registerForm = this._fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          alphabetsValidator(),
          spacesValidator(),
          repeateCharacterValidator(),
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          spacesValidator(),
          emailValidator(),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          passwordValidator(),
        ],
      ],
      confirmPassword: [
        '',
        [
          Validators.required,
          spacesValidator(),
        ],
      ],
    }, { validators: passwordMatchValidator });

    this.otpForm = this._fb.group({
      otp: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
        onlyNumbersValidator()
      ]]
    });
  }

  createAccount(): void {
    if (!this.registerForm.valid) {
      this.registerForm.markAllAsTouched();
      return;
    }
  
    this.loading = true;
    const formData = this.registerForm.value;
  
    this._authService.userRegister(formData)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            Notiflix.Notify.success('OTP sent successfully to your email');
            this.showOtpForm = true;
            this._startResendOtpTimer();
          } else {
            Notiflix.Notify.failure(response.message || 'Failed to send otp');
          }
        },
        error: (error) => {
          this.loading = false;
          Notiflix.Notify.failure(error.error.message || 'Something went wrong');
        }
      });
  }

  verifyOTP(): void {
    if (!this.otpForm.valid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const email = this.registerForm.get('email')?.value;
    const otp = this.otpForm.get('otp')?.value;

    this._authService.verifyOTP(email, otp)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            Notiflix.Notify.success('Registration successful!');
            setTimeout(() => {
              this._router.navigate(['/login']);
            }, 2000);
          } else {
            Notiflix.Notify.failure(response.message || 'Invalid OTP');
          }
        },
        error: (error) => {
          this.loading = false;
          Notiflix.Notify.failure(error.error.message || 'Failed to verify OTP');
        }
      });
  }

  private _startResendOtpTimer(): void {
    this.resendOtpTimer = 60; 
    
    if (this._resendOtpInterval) {
      clearInterval(this._resendOtpInterval);
    }
    
    this._resendOtpInterval = setInterval(() => {
      if (this.resendOtpTimer > 0) {
        this.resendOtpTimer--;
      } else {
        clearInterval(this._resendOtpInterval);
      }
    }, 1000);
  }

  resendOTP(): void {
    if (!this.showOtpForm || this.resendOtpTimer > 0) return;

    this.loading = true;
    const formData = this.registerForm.value;

    this._authService.userRegister(formData)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            Notiflix.Notify.success('OTP resent successfully');
            this.otpForm.reset();
            this._startResendOtpTimer(); 
          } else {
            Notiflix.Notify.failure(response.message || 'Failed to resend OTP');
          }
        },
        error: (error) => {
          this.loading = false;
          Notiflix.Notify.failure(error.error.message || 'Failed to resend OTP');
        }
      });
  }

  hasError(controlName: string, errorName: string): boolean {
    return this.registerForm.controls[controlName].hasError(errorName);
  }
  
  hasFormError(errorName: string): boolean {
    return this.registerForm.hasError(errorName);
  }
  
  hasOtpError(errorName: string): boolean {
    return this.otpForm.controls['otp'].hasError(errorName);
  }
}