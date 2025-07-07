import { Component, OnDestroy } from '@angular/core';
import { UserNavComponent } from '../../../shared/user-nav/user-nav.component';
import { UserFooterComponent } from '../../../shared/user-footer/user-footer.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { emailValidator, passwordValidator, spacesValidator } from '../../../validators/formValidators';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectLoading } from '../../../core/store/auth/auth.selectors';
import { AuthActions } from '../../../core/store/auth/auth.actions';
import { Observable, Subject, takeUntil } from 'rxjs';
import { GoogleAuthService } from '../../../core/services/user/googleAuth/google-auth.service';
import Notiflix from 'notiflix';
import { AuthService } from '../../../core/services/user/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [UserNavComponent, UserFooterComponent, ReactiveFormsModule, CommonModule, RouterModule, AsyncPipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnDestroy {
  private readonly _destroy$ = new Subject<void>();
  loginForm!: FormGroup; 
  forgotForm!: FormGroup;
  showPassword: boolean = false;
  loading$: Observable<boolean>;
  showForgotpassword: boolean = false;
  
  constructor(
    private _fb: FormBuilder,
    private _authService: AuthService,
    private _googleAuthService: GoogleAuthService,
    private _store: Store,
    private _router: Router
  ) {
    this.showForgotpassword = false;
    this._initializeForms();
    this.loading$ = this._store.select(selectLoading);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _initializeForms(): void {
    this.loginForm = this._fb.group({
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
          passwordValidator()
        ]
      ]
    });
    
    this.forgotForm = this._fb.group({
      email: [
        '',
        [
          Validators.required,
          spacesValidator(),
          emailValidator(),
        ],
      ]
    });
  }

  signIn(): void {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const formData = this.loginForm.value;
    this._store.dispatch(AuthActions.login(formData));
  }

  forgotPassword(): void {
    if (!this.forgotForm.valid) {
      this.forgotForm.markAllAsTouched();
      return;
    }
    
    const formData = this.forgotForm.value;
    this._authService.forgotPassword(formData)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response) => {          
          if(response.success){
          this._router.navigateByUrl('/');
          Notiflix.Notify.success('Reset email sent to your inbox');
          }else{
            Notiflix.Notify.failure(`${response.message}`);

          }
          
        },
        error: (err) => {
          Notiflix.Notify.failure(err.error.message);
        }
      });
  }

  hasError(controlName: string, errorName: string): boolean {
    return this.loginForm.controls[controlName].hasError(errorName);
  }
  
  hasErrorForgot(controlName: string, errorName: string): boolean {
    return this.forgotForm.controls[controlName].hasError(errorName);
  }
  
  hasFormError(errorName: string): boolean {
    return this.loginForm.hasError(errorName);
  }
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  loginWithGoogle(): void {
    this._store.dispatch(AuthActions.googleLogin());
  }
  
  openForgotpassword(): void {
    this.showForgotpassword = !this.showForgotpassword;
  }
}