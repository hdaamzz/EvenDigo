import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserProfileService } from '../../../../core/services/user/user.profile.service';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import Notiflix from 'notiflix';
import {AutoCompleteModule } from 'primeng/autocomplete'
import { DatePickerModule } from 'primeng/datepicker';
import { alphabetsValidator, mobileNumberValidator, repeateCharacterValidator, spacesValidator } from '../../../../validators/formValidators';
import { CloudinaryService } from '../../../../core/services/utility/cloudinary.service';


@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,Dialog, ButtonModule, InputTextModule,AutoCompleteModule,DatePickerModule],
  templateUrl: './profile.details.component.html',
  styleUrl: './profile.details.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ProfileDetailsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  userId: string | undefined;
  user: any = {};
  userForm!: FormGroup;
  editMode = false;
  isLoading = false;
  imageError = false;
  defaultImageUrl = 'https://res.cloudinary.com/dfpezlzsy/image/upload/v1741318747/user.icon_slz5l0.png';
  maxDate: Date = new Date();
  verificationData={
    user_id:'',
    status:'',
    note:''
  };
  allIndianCities: string[] = [
    'Mumbai', 'Delhi','Kochi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 
    'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 
    'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal', 
    'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 
    'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 
    'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad', 
    'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 
    'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 
    'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Guwahati', 
    'Chandigarh', 'Solapur', 'Hubli', 'Dharwad', 'Bareilly', 
    'Moradabad', 'Mysore', 'Gurgaon', 'Aligarh', 'Jalandhar','Calicut'
  ];
  indianCities: string[] = [];
  


  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private cloudinaryService: CloudinaryService,

  ) {
    this.userProfileService.currentUserId.subscribe(userId => {
      this.userId = userId;
     
      
      if (userId) {
        this.loadUserProfile();
        this.vereficationRequestDetails();
      }
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    
  }
  initializeForm(): void {
    this.userForm = this.fb.group({
      name: [this.user.name || '',[Validators.required,Validators.minLength(3),spacesValidator(),repeateCharacterValidator()]],
      phone: [this.user.phone || '', [Validators.required,mobileNumberValidator()]],
      dateOfBirth: [this.user.dateOfBirth ? new Date(this.user.dateOfBirth) : '', Validators.required],
      location: [this.user.location || '', [Validators.required,Validators.minLength(2),alphabetsValidator()]],
      bio: [this.user.bio || '', [Validators.minLength(3)]],
      gender: [this.user.gender || '', [Validators.required,alphabetsValidator()]]
    });
  }
  
  loadUserProfile(): void {
    this.isLoading = true;
    if (!this.userId) {
      Notiflix.Notify.failure('User ID is missing');
      this.isLoading = false;
      return;
    }

    this.userProfileService.userDetails(this.userId).subscribe({
      next: (userData) => {
        this.user = userData;
        if (this.user.dateOfBirth) {
          this.user.dateOfBirth = new Date(this.user.dateOfBirth);
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
  }
  
  
  updateProfile(): void {
    if (!this.userForm.valid) {
      this.userForm.markAllAsTouched();
      return;
    }
    
    if (this.userForm.valid) {

      this.isLoading = true;
      const updatedData = this.userForm.value;
      
      this.userProfileService.updateUserProfile(this.userId, updatedData).subscribe({
        next: (response) => {
          this.user = { ...this.user, ...updatedData };
          Notiflix.Notify.success('Profile updated successfully');
          this.editMode = false;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          // Notiflix.Notify.failure('Failed to update profile');
          this.isLoading = false;
        }
      });
    }
  }
  
  cancelEdit(): void {
    this.editMode = false;
    this.initializeForm(); 
  }
  

  filterCities(event: { query: string }) {
    const query = event.query.toLowerCase();
    this.indianCities = this.allIndianCities.filter(city => 
      city.toLowerCase().includes(query)
    );
  }
  sendVereficationRequest(){
    if (!this.userId) {
      Notiflix.Notify.failure('User ID is missing');
      return;
    }
    this.userProfileService.verificationRequest(this.userId).subscribe({
      next: (response) => {
        this.vereficationRequestDetails();
        Notiflix.Notify.success(response.message);
      },
      error: (error) => {
        console.error('Error verification profile:', error);
        Notiflix.Notify.failure(error.message);
      }
    });
  }
  vereficationRequestDetails(){
    if (!this.userId) {
      Notiflix.Notify.failure('User ID is missing');
      return;
    }
    this.userProfileService.verificationRequestDetails(this.userId).subscribe({
      next: (response) => {        
        this.verificationData=response.data
        
      },
      error: (error) => {
        console.error('Error getting verification profile:', error);
        // Notiflix.Notify.failure(error.message);
      }
    });
  }
  hasError(controlName: string, errorName: string) {
    return this.userForm.controls[controlName].hasError(errorName);
  }


  //image uploading section

  openFileSelector(): void {
    this.fileInput.nativeElement.click();
  }
  
  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    const file: File | null = element.files?.[0] || null;
    
    if (file) {
      this.isLoading = true;
      
      this.cloudinaryService.uploadProfileImage(file).subscribe({
        next: (response) => {
          if (response.success && response.imageUrl) {
            this.user.profileImg = response.imageUrl;
            Notiflix.Notify.success('Profile picture updated successfully');
          } else {
            Notiflix.Notify.failure(response.message || 'Unknown error occurred');
            this.imageError = true;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating profile image:', error);
          Notiflix.Notify.failure(error.message || 'Failed to update profile picture');
          this.isLoading = false;
          this.imageError = true;
        }
      });
    }
  }
}