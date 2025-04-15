import { Component } from '@angular/core';
import { UserNavComponent } from '../../../shared/user-nav/user-nav.component';
import { UserFooterComponent } from '../../../shared/user-footer/user-footer.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { emailValidator, passwordValidator, spacesValidator } from '../../../validators/formValidators';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectLoading } from '../../../core/store/auth/auth.selectors';
import { AuthActions } from '../../../core/store/auth/auth.actions';
import { Observable } from 'rxjs';
import { GoogleAuthService } from '../../../core/services/user/googleAuth/google-auth.service';
import Notiflix from 'notiflix';
import { AuthService } from '../../../core/services/user/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [UserNavComponent, UserFooterComponent, ReactiveFormsModule, CommonModule, RouterModule, AsyncPipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginFrom!: FormGroup;
  forgotForm!: FormGroup;
  showPassword = false;
  loading$: Observable<boolean>;
  showForgotpassword: boolean = false
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
    private store: Store,
    private router:Router
  ) {
    this.showForgotpassword = false
    this.initializeForms();
    this.loading$ = this.store.select(selectLoading);
  }


  private initializeForms() {
      this.loginFrom = this.fb.group({
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
      }),
      this.forgotForm = this.fb.group({
        email: [
          '',
          [
            Validators.required,
            spacesValidator(),
            emailValidator(),
          ],
        ]
      })
  }

  signIn() {
    if (!this.loginFrom.valid) {
      this.loginFrom.markAllAsTouched();
      return;
    }
    const formData = this.loginFrom.value;
    this.store.dispatch(AuthActions.login(formData));
  };

  
  forgotPassword() {
    
    
    if (!this.forgotForm.valid) {
      this.forgotForm.markAllAsTouched();
      return;
    }
    
    const formData = this.forgotForm.value;
    this.authService.forgotPassword(formData).subscribe({
      next:(response) => {
        this.router.navigateByUrl('/')
        Notiflix.Notify.success('Reset email sent to your inbox')
      },
      error:(err) => {
        Notiflix.Notify.failure(err.error.message)
      }
    })
  }

  hasError(controlName: string, errorName: string) {
    return this.loginFrom.controls[controlName].hasError(errorName);
  }
  
  hasErrorForgot(controlName: string, errorName: string) {
    return this.forgotForm.controls[controlName].hasError(errorName);
  }
  
  hasFormError(errorName: string) {
    return this.loginFrom.hasError(errorName);
  }
  
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
  loginWithGoogle() {
    this.store.dispatch(AuthActions.googleLogin());
  }
  
  openForgotpassword() {
    this.showForgotpassword = !this.showForgotpassword
  }
}