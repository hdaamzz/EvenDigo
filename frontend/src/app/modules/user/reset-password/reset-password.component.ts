import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import Notiflix from 'notiflix';

import { UserNavComponent } from '../../../shared/user-nav/user-nav.component';
import { UserFooterComponent } from '../../../shared/user-footer/user-footer.component';
import { passwordValidator } from '../../../validators/formValidators';
import { AuthService } from '../../../core/services/user/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [UserNavComponent, UserFooterComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
  standalone: true
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  private readonly _destroy$ = new Subject<void>();
  
  public resetForm!: FormGroup;
  public showPassword = false;
  public showConfirmPassword = false;
  public loading = false;
  
  public email = '';
  private _token = '';

  constructor(
    private _fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private _authService: AuthService
  ) {}

  public ngOnInit(): void {
    this._initQueryParams();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public resetPassword(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    
    this.loading = true;
    const resetData = {
      email: this.email,
      token: this._token,
      newPassword: this.resetForm.get('password')?.value
    };

    this._authService.resetPassword(resetData)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
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

  public hasError(controlName: string, errorName: string): boolean {
    return this.resetForm.get(controlName)?.touched && 
           this.resetForm.get(controlName)?.hasError(errorName) || false;
  }

  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  public toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private _initQueryParams(): void {
    this._route.queryParams
      .pipe(takeUntil(this._destroy$))
      .subscribe(params => {
        this.email = params['email'] || '';
        this._token = params['token'] || '';
        
        if (!this.email || !this._token) {
          Notiflix.Notify.failure('Invalid reset link');
          this._router.navigate(['/']);
          return;
        }
        
        this._initializeForm();
      });
  }

  private _initializeForm(): void {
    this.resetForm = this._fb.group({
      password: ['', [Validators.required, passwordValidator()]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } 
    
    return null;
  }
}