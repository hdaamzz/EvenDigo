import { AsyncPipe, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { emailValidator, passwordValidator, spacesValidator } from '../../../validators/formValidators';
import { AuthActions } from '../../../core/store/auth/auth.actions';
import { selectLoading } from '../../../core/store/auth/auth.selectors';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule, CommonModule, RouterModule,AsyncPipe],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {
  adminLoginFrom!: FormGroup;
  showPassword = false;
  loading$: Observable<boolean>;
  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {
    this.initializeForms();
    this.loading$ = this.store.select(selectLoading);
  }


  private initializeForms() {
    this.adminLoginFrom = this.fb.group({
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
    })
  }

  signIn() {
    if (!this.adminLoginFrom.valid) {
      this.adminLoginFrom.markAllAsTouched();
      return;
    }
    const formData = this.adminLoginFrom.value;
    this.store.dispatch(AuthActions.adminLogin(formData));
  };



  hasError(controlName: string, errorName: string) {
    return this.adminLoginFrom.controls[controlName].hasError(errorName);
  }
  hasFormError(errorName: string) {
    return this.adminLoginFrom.hasError(errorName);
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
