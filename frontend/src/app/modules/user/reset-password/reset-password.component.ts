import { Component, OnInit } from '@angular/core';
import { UserNavComponent } from '../../../shared/user-nav/user-nav.component';
import { UserFooterComponent } from '../../../shared/user-footer/user-footer.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/user/auth.service';
import Notiflix from 'notiflix';
import { passwordValidator } from '../../../validators/formValidators';

@Component({
  selector: 'app-reset-password',
  imports: [UserNavComponent,UserFooterComponent,ReactiveFormsModule,CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit{
  resetForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  email: string = '';
  token: string = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}


  ngOnInit(): void {

    
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.token = params['token'] || '';
      
      
      if (!this.email || !this.token) {
        Notiflix.Notify.failure('Invalid reset link');
        this.router.navigate(['/']);
        return;
      }
      this.initializeForm();
    });
  }

  private initializeForm(): void {
   
    this.resetForm = this.fb.group({
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
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
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

    this.authService.resetPassword(resetData).subscribe({
      next: (response) => {
        this.loading = false;
        Notiflix.Notify.success('Password reset successful');
        this.router.navigate(['/login']);
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
