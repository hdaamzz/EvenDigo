import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserNavComponent } from '../../../shared/user-nav/user-nav.component';
import { UserFooterComponent } from '../../../shared/user-footer/user-footer.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Notiflix from 'notiflix';
import { passwordValidator } from '../../../validators/formValidators';
import { AuthService } from '../../../core/services/user/auth/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [UserNavComponent, UserFooterComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  private readonly _destroy$ = new Subject<void>();
  resetForm!: FormGroup;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  email: string = '';
  token: string = '';
  loading: boolean = false;

  constructor(
    private _fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private _authService: AuthService
  ) {}

  ngOnInit(): void {
    this._route.queryParams
      .pipe(takeUntil(this._destroy$))
      .subscribe(params => {
        this.email = params['email'] || '';
        this.token = params['token'] || '';
        
        if (!this.email || !this.token) {
          Notiflix.Notify.failure('Invalid reset link');
          this._router.navigate(['/']);
          return;
        }
        this._initializeForm();
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _initializeForm(): void {
    this.resetForm = this._fb.group({
      password: [
        '',
        [
          Validators.required,
          passwordValidator()
        ]
      ],
      confirmPassword: [
        '',
        [
          Validators.required
        ]
      ]
    }, { validators: this._passwordMatchValidator });
  }

  private _passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      return null;
    }
  }

  resetPassword(): void {
    if (!this.resetForm.valid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    
    this.loading = true;
    const newPassword = this.resetForm.get('password')?.value;

    const resetData = {
      email: this.email,
      token: this.token,
      newPassword: newPassword
    };

    this._authService.resetPassword(resetData)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          Notiflix.Notify.success('Password reset successful');
          this._router.navigate(['/login']);
        },
        error: (error) => {
          this.loading = false;
          Notiflix.Notify.failure(error.error.message || 'Password reset failed');
        }
      });
  }

  hasError(controlName: string, errorName: string): boolean {
    return this.resetForm.controls[controlName].hasError(errorName);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}