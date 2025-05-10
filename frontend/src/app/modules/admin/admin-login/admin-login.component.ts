import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
export class AdminLoginComponent implements OnInit {
  adminLoginForm!: FormGroup;
  showPassword = false;
  loading$: Observable<boolean>;

  constructor(
    private _fb: FormBuilder,
    private _store: Store
  ) {
    this.loading$ = this._store.select(selectLoading);
  }

  ngOnInit(): void {
    this._initializeForm();
  }

  private _initializeForm(): void {
    this.adminLoginForm = this._fb.group({
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
  }

  signIn(): void {
    if (!this.adminLoginForm.valid) {
      this.adminLoginForm.markAllAsTouched();
      return;
    }
    const formData = this.adminLoginForm.value;
    this._store.dispatch(AuthActions.adminLogin(formData));
  }

  hasError(controlName: string, errorName: string): boolean {
    return this.adminLoginForm.controls[controlName].hasError(errorName);
  }

  hasFormError(errorName: string): boolean {
    return this.adminLoginForm.hasError(errorName);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}