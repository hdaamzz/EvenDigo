import { Component } from '@angular/core';
import { UserNavComponent } from "../../../shared/user-nav/user-nav.component";
import { UserFooterComponent } from "../../../shared/user-footer/user-footer.component";
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterLink, RouterModule } from '@angular/router';
import { alphabetsValidator ,emailValidator ,mobileNumberValidator,spacesValidator } from '../../../validators/formValidators';
import { onlyNumbersValidator,passwordMatchValidator,passwordValidator,repeateCharacterValidator } from '../../../validators/formValidators';
import { AuthService } from '../../../core/services/user/auth.service';
import Notiflix from 'notiflix';  
import { GoogleAuthService } from '../../../core/services/user/googleAuth/google-auth.service';

@Component({
  selector: 'app-register',
  imports: [UserNavComponent, UserFooterComponent,CommonModule, ReactiveFormsModule,RouterModule ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm!: FormGroup;
  otpForm!: FormGroup;
  isFormSubmited : boolean = false;
  showOtpForm: boolean = false;
  loading: boolean = false;
  resendOtpTimer: number = 60;
  resendOtpInterval: any;




  constructor(
     private fb:FormBuilder ,
     private authService:AuthService,
     private router: Router,
  ){
      this.initializeForms();
    }
  
    private initializeForms() {
      this.registerForm = this.fb.group({
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
  
      this.otpForm = this.fb.group({
        otp: ['', [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(6),
          onlyNumbersValidator()
        ]]
      });
    }


    createAccount() {
      if (!this.registerForm.valid) {
        this.registerForm.markAllAsTouched();
        return;
      }
    
      this.loading = true;
      const formData = this.registerForm.value;
    
      this.authService.userRegister(formData).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            Notiflix.Notify.success('OTP sent successfully to your email');
            this.showOtpForm = true;
            this.startResendOtpTimer();
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
    verifyOTP() {
      if (!this.otpForm.valid) {
        this.otpForm.markAllAsTouched();
        return;
      }
  
      this.loading = true;
      const email = this.registerForm.get('email')?.value;
      const otp = this.otpForm.get('otp')?.value;
  
      this.authService.verifyOTP(email, otp).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            Notiflix.Notify.success('Registration successful!');
            setTimeout(() => {
              this.router.navigate(['/login']);
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
    startResendOtpTimer() {
      this.resendOtpTimer = 60; 
      this.resendOtpInterval = setInterval(() => {
        if (this.resendOtpTimer > 0) {
          this.resendOtpTimer--;
        } else {
          clearInterval(this.resendOtpInterval);
        }
      }, 1000);
    }
  
    resendOTP() {
      if (!this.showOtpForm || this.resendOtpTimer > 0) return;
  
      this.loading = true;
      const formData = this.registerForm.value;
  
      this.authService.userRegister(formData).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            Notiflix.Notify.success('OTP resent successfully');
            this.otpForm.reset();
            this.startResendOtpTimer(); 
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



    hasError(controlName: string, errorName: string) {
      return this.registerForm.controls[controlName].hasError(errorName);
    }
    hasFormError(errorName: string) {
      return this.registerForm.hasError(errorName);
    }
    hasOtpError(errorName: string) {
      return this.otpForm.controls['otp'].hasError(errorName);
    }
    

}
