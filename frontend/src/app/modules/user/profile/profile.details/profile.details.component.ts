import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import Notiflix from 'notiflix';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
import { alphabetsValidator, changePasswordMatchValidator, mobileNumberValidator, repeateCharacterValidator, spacesValidator } from '../../../../validators/formValidators';
import { CloudinaryService } from '../../../../core/services/utility/cloudinary.service';
import { UserProfileService } from '../../../../core/services/user/profile/user.profile.service';
import { catchError, of, tap, Subscription, BehaviorSubject } from 'rxjs';
import { passwordValidator } from '../../../../validators/formValidators';
import { SecureImagePipe } from '../../../../core/pipes/secure-image.pipe';



@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Dialog, ButtonModule, InputTextModule, AutoCompleteModule, DatePickerModule,SecureImagePipe],
  templateUrl: './profile.details.component.html',
  styleUrl: './profile.details.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ProfileDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef;
  user: any = {};
  userForm!: FormGroup;
  editMode = false;
  isLoading = false;
  imageError = false;
  defaultImageUrl = 'https://res.cloudinary.com/dfpezlzsy/image/upload/v1741318747/user.icon_slz5l0.png';
  profileImageUrl$ = new BehaviorSubject<string>(this.defaultImageUrl);
  isImageLoading = false;
  maxDate: Date = new Date();
  achievements: any[]=[]
  eventOrganized:Number=0;
  eventParticipated:Number=0
  statsData = {
    eventsAttended: 12,
    achievements: 4,
    followedEvents: 8
  };

  verificationData = {
    user_id: '',
    status: '',
    note: ''
  };

  changePasswordForm!: FormGroup;
  showChangePasswordDialog = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  private subscriptions: Subscription[] = [];

  badgeCategoryColors: Record<string, { gradient: string; icon: string; glow: string; border: string }> = {
    'event': { gradient: 'from-blue-600 to-cyan-400', icon: 'text-cyan-100', glow: 'cyan-400/30', border: 'cyan-400' },
    'achievement': { gradient: 'from-yellow-500 to-amber-400', icon: 'text-amber-100', glow: 'amber-400/30', border: 'amber-400' },
    'special': { gradient: 'from-fuchsia-600 to-pink-400', icon: 'text-pink-100', glow: 'pink-400/30', border: 'pink-400' },
    'community': { gradient: 'from-green-600 to-emerald-400', icon: 'text-emerald-100', glow: 'emerald-400/30', border: 'emerald-400' },
    'milestone': { gradient: 'from-red-600 to-orange-400', icon: 'text-orange-100', glow: 'orange-400/30', border: 'orange-400' },
  };

  badgeColorSets = [
    { gradient: 'from-purple-600 to-indigo-500', icon: 'text-indigo-100', glow: 'indigo-400/30', border: 'indigo-400' },
    { gradient: 'from-blue-600 to-cyan-400', icon: 'text-cyan-100', glow: 'cyan-400/30', border: 'cyan-400' },
    { gradient: 'from-green-600 to-emerald-400', icon: 'text-emerald-100', glow: 'emerald-400/30', border: 'emerald-400' },
    { gradient: 'from-yellow-500 to-amber-400', icon: 'text-amber-100', glow: 'amber-400/30', border: 'amber-400' },
    { gradient: 'from-red-600 to-orange-400', icon: 'text-orange-100', glow: 'orange-400/30', border: 'orange-400' },
    { gradient: 'from-fuchsia-600 to-pink-400', icon: 'text-pink-100', glow: 'pink-400/30', border: 'pink-400' },
    { gradient: 'from-indigo-600 to-blue-400', icon: 'text-blue-100', glow: 'blue-400/30', border: 'blue-400' },
    { gradient: 'from-emerald-600 to-teal-400', icon: 'text-teal-100', glow: 'teal-400/30', border: 'teal-400' }
  ];

  allIndianCities: string[] = [
    'Mumbai', 'Delhi', 'Kochi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 
    'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 
    'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal', 
    'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 
    'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 
    'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad', 
    'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 
    'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 
    'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Guwahati', 
    'Chandigarh', 'Solapur', 'Hubli', 'Dharwad', 'Bareilly', 
    'Moradabad', 'Mysore', 'Gurgaon', 'Aligarh', 'Jalandhar', 'Calicut'
  ];
  indianCities: string[] = [];

  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private cloudinaryService: CloudinaryService,
  ) {
  }

  ngOnInit(): void {
    this.initializeForm();
    this.initializePasswordForm();
    this.loadUserProfile();
    this.verificationRequestDetails();
    this.loadUserBadges();
    this.fetchEventCount();
    this.fetchUserBookingCount();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  getBadgeStyles(badge: any, index: number): any {
    if (badge.category && this.badgeCategoryColors[badge.category]) {
      return this.badgeCategoryColors[badge.category];
    }
    
    return this.badgeColorSets[index % this.badgeColorSets.length];
  }

  getBadgeColorClass(badge: any, index: number): string {
    return this.getBadgeStyles(badge, index).gradient;
  }

  getBadgeIconColor(badge: any, index: number): string {
    return this.getBadgeStyles(badge, index).icon;
  }

  getBadgeGlowColor(badge: any, index: number): string {
    return this.getBadgeStyles(badge, index).glow;
  }

  getBadgeBorderColor(badge: any, index: number): string {
    return this.getBadgeStyles(badge, index).border;
  }

  initializeForm(): void {
    this.userForm = this.fb.group({
      name: [this.user.name || '', [Validators.required, Validators.minLength(3), spacesValidator(), repeateCharacterValidator()]],
      phone: [this.user.phone || '', [Validators.required, mobileNumberValidator()]],
      dateOfBirth: [this.user.dateOfBirth ? new Date(this.user.dateOfBirth) : '', Validators.required],
      location: [this.user.location || '', [Validators.required, Validators.minLength(2), alphabetsValidator()]],
      bio: [this.user.bio || '', [Validators.minLength(3)]],
      gender: [this.user.gender || '', [Validators.required, alphabetsValidator()]]
    });
  }
  
  initializePasswordForm(): void {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, passwordValidator()]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: changePasswordMatchValidator
    });
  }
  
  openChangePasswordDialog(): void {
    this.showChangePasswordDialog = true;
    this.initializePasswordForm();
  }
  
  closeChangePasswordDialog(): void {
    this.showChangePasswordDialog = false;
    this.changePasswordForm.reset();
  }

  loadUserProfile(): void {
  const sub = this.userProfileService.userDetails().subscribe({
    next: (userData) => {
      this.user = userData.data;
      if (this.user.dateOfBirth) {
        this.user.dateOfBirth = new Date(this.user.dateOfBirth);
      }
      
      if (this.user.profileImgPublicId) {
        this.cloudinaryService.getSecureImageUrl(
          this.user.profileImgPublicId, 
          this.user.profileImg || this.defaultImageUrl
        ).subscribe(url => {
          this.profileImageUrl$.next(url);
        });
      } else if (this.user.profileImg) {
        this.profileImageUrl$.next(this.user.profileImg);
      }
      
      this.initializeForm();
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error loading user profile:', error);
      Notiflix.Notify.failure('Failed to load profile data');
      this.isLoading = false;
    }
  });
  this.subscriptions.push(sub);
}
  
  fetchEventCount() {
    const sub = this.userProfileService.getUserEvents().pipe(
      tap((response) => {
        if(response.data){
          this.eventOrganized = response.data.length;
        }
      }),
      catchError((error) => {
        console.error('Error fetching events:', error);
        Notiflix.Notify.failure('Error fetching events');
        return of(null);
      })
    ).subscribe();
    this.subscriptions.push(sub);
  }

  loadUserBadges(): void {
    const sub = this.userProfileService.getBadgeById().subscribe({
      next: (response) => {
        this.achievements = response.data;
      }
    });
    this.subscriptions.push(sub);
  }

  fetchUserBookingCount() {
    const sub = this.userProfileService.getUserBookings().subscribe({
      next: (response) => {
        if (response) {
          this.eventParticipated = response.data.length;
        } else {
          Notiflix.Notify.failure('Failed to load your events.');
        }
      },
      error: (error) => {
        console.error('Error loading events:', error);
        Notiflix.Notify.failure('Error loading your events.');
      },
    });
    this.subscriptions.push(sub);
  }

  updateProfile(): void {
    if (!this.userForm.valid) {
      this.userForm.markAllAsTouched();
      return;
    }

    if (this.userForm.valid) {
      this.isLoading = true;
      const updatedData = this.userForm.value;
      
      const sub = this.userProfileService.updateUserProfile(updatedData).subscribe({
        next: (response) => {
          this.user = { ...this.user, ...updatedData };
          Notiflix.Notify.success('Profile updated successfully');
          this.editMode = false;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          Notiflix.Notify.failure(error.message || 'Failed to update profile');
          this.isLoading = false;
        }
      });
      this.subscriptions.push(sub);
    }
  }
  
  submitPasswordChange(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }
  
    this.isLoading = true;
    const passwordData = {
      currentPassword: this.changePasswordForm.value.currentPassword,
      newPassword: this.changePasswordForm.value.newPassword,
      confirmPassword: this.changePasswordForm.value.confirmPassword
    };
  
    const sub = this.userProfileService.changePassword(passwordData).subscribe({
      next: (response) => {
        Notiflix.Notify.success('Password changed successfully');
        this.closeChangePasswordDialog();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Password change error:', error);
        Notiflix.Notify.failure(error.message || 'Failed to change password');
        this.isLoading = false;
      }
    });
    this.subscriptions.push(sub);
  }

  cancelEdit(): void {
    this.editMode = false;
    this.initializeForm();
  }

  filterCities(event: { query: string }): void {
    const query = event.query.toLowerCase();
    this.indianCities = this.allIndianCities.filter(city =>
      city.toLowerCase().includes(query)
    );
  }

  sendVerificationRequest(): void {
    const sub = this.userProfileService.verificationRequest().subscribe({
      next: (response) => {
        this.verificationRequestDetails();
        Notiflix.Notify.success(response.message);
      },
      error: (error) => {
        console.error('Error verification profile:', error);
        Notiflix.Notify.failure(error.message);
      }
    });
    this.subscriptions.push(sub);
  }

  verificationRequestDetails(): void {
    const sub = this.userProfileService.verificationRequestDetails().subscribe({
      next: (response) => {
        this.verificationData = response.data;
      },
      error: (error) => {
        console.error('Error getting verification profile:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  openFileSelector(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
  const element = event.target as HTMLInputElement;
  const file: File | null = element.files?.[0] || null;

  if (file) {
    this.isImageLoading = true;
    
    const sub = this.cloudinaryService.uploadProfileImage(file).subscribe({
      next: (response) => {
        if (response.success) {
          this.user.profileImg = response.imageUrl;
          this.user.profileImgPublicId = response.publicId;
          
          this.profileImageUrl$.next(response.imageUrl as unknown as string);
          
          Notiflix.Notify.success('Profile picture updated successfully');
        } else {
          Notiflix.Notify.failure(response.message || 'Unknown error occurred');
          this.imageError = true;
        }
        this.isImageLoading = false;
      },
      error: (error) => {
        console.error('Error updating profile image:', error);
        Notiflix.Notify.failure(error.message || 'Failed to update profile picture');
        this.isImageLoading = false;
        this.imageError = true;
      }
    });
    this.subscriptions.push(sub);
  }
}

  getVerificationStatusClass(): string {
    switch (this.verificationData.status) {
      case 'Verified':
        return 'from-green-600 to-[#00ff66]';
      case 'Pending':
        return 'from-yellow-600 to-yellow-400';
      case 'Rejected':
        return 'from-red-700 to-red-500';
      default:
        return 'from-blue-500 to-[#00ff66]';
    }
  }

  getVerificationIcon(): string {
    switch (this.verificationData.status) {
      case 'Verified':
        return 'check-circle';
      case 'Pending':
        return 'clock';
      case 'Rejected':
        return 'times-circle';
      default:
        return 'shield-alt';
    }
  }

  hasCompletedProfile(): boolean {
    return !!(this.user.name && this.user.email && this.user.phone &&
      this.user.bio && this.user.location && this.user.dateOfBirth);
  }
  
  hasError(controlName: string, errorName: string): boolean {
    return this.userForm.controls[controlName].hasError(errorName);
  }
  
  hasPasswordError(controlName: string, errorName: string): boolean {
    return this.changePasswordForm.controls[controlName].hasError(errorName);
  }

  refreshImageUrl(): void {
  if (this.user.profileImgPublicId) {
    this.isImageLoading = true;
    
    const sub = this.cloudinaryService.refreshImageUrl(this.user.profileImgPublicId).subscribe({
      next: (response) => {
        this.profileImageUrl$.next(response.imageUrl);
        this.isImageLoading = false;
      },
      error: (error) => {
        console.error('Error refreshing image URL:', error);
        this.isImageLoading = false;
      }
    });
    this.subscriptions.push(sub);
  }
}
}