import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserProfileService } from '../../../../../core/services/user/profile/user.profile.service';
import { IEvent } from '../../../../../core/models/event.interface';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { dateRangeValidator, futureDateValidator } from '../../../../../validators/formValidators';
import { UserNavComponent } from '../../../../../shared/user-nav/user-nav.component';
import Notiflix from 'notiflix';
import { catchError, of, tap } from 'rxjs';

interface TicketItem {
  type: string;
  price: number;
  quantity: number;
}


@Component({
  selector: 'app-event-edit',
  imports: [CommonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    DatePickerModule, 
    SelectModule, 
    InputNumberModule, 
    ButtonModule, 
    InputTextModule,
    UserNavComponent],
  templateUrl: './event-edit.component.html',
  styleUrl: './event-edit.component.css'
})
export class EventEditComponent {
  eventId: string | null = null;
  eventForm!: FormGroup;
  event: IEvent | null = null;
  loading = false;
  loadingEvent = false;

  mainBannerPreview: string | null = null;
  promotionalImagePreview: string | null = null;
  mainBannerFile: File | null = null;
  promotionalImageFile: File | null = null;

  currentTicketType: string | null = '';
  currentTicketPrice: number | null = null;
  currentTicketQuantity: number = 0;
  ticketsList: TicketItem[] = [];

  today = new Date();
  
  // Define options for form dropdowns
  eventTypes = [
    { label: 'Conference', value: 'Conference' },
    { label: 'Concert', value: 'Concert' },
    { label: 'Workshop', value: 'Workshop' },
    { label: 'Exhibition', value: 'Exhibition' },
    { label: 'Meetup', value: 'Meetup' },
    { label: 'Party', value: 'Party' },
    { label: 'Show', value: 'Show' },
    { label: 'Webinar', value: 'Webinar' },
    { label: 'Seminar', value: 'Seminar' },
    { label: 'Networking Event', value: 'Networking Event' },
    { label: 'Hackathon', value: 'Hackathon' },
    { label: 'Launch Event', value: 'Launch Event' },
    { label: 'Award Ceremony', value: 'Award Ceremony' },
    { label: 'Sports Event', value: 'Sports Event' },
    { label: 'Open Mic', value: 'Open Mic' },
    { label: 'Training Session', value: 'Training Session' },
    { label: 'Entertainment', value: 'Entertainment' },
  ];
  
  visibilityOptions = [
    { label: 'Public', value: 'Public' },
    { label: 'Private', value: 'Private' }
  ];
  
  cities = [
    { label: 'Mumbai', value: 'Mumbai' },
    { label: 'Delhi', value: 'Delhi' },
    { label: 'Bangalore', value: 'Bangalore' },
    { label: 'Hyderabad', value: 'Hyderabad' },
    { label: 'Chennai', value: 'Chennai' },
    { label: 'Kolkata', value: 'Kolkata' },
    { label: 'Pune', value: 'Pune' },
    { label: 'Jaipur', value: 'Jaipur' },
    { label: 'Ahmedabad', value: 'Ahmedabad' },
    { label: 'Surat', value: 'Surat' }
  ];
  
  availableTicketTypes = [
    { label: 'Regular', value: 'Regular' },
    { label: 'VIP', value: 'VIP' },
    { label: 'Gold', value: 'Gold' }
  ];
  
  ageRestrictionOptions = [
    { label: 'Yes', value: 'true' },
    { label: 'No', value: 'false' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private profileService: UserProfileService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.route.params.subscribe(params => {
      this.eventId = params['id'];
      if (this.eventId) {
        this.loadEvent(this.eventId);
      }
    });
  }

  initForm(): void {
    this.eventForm = this.fb.group({
      eventTitle: ['', Validators.required],
      eventDescription: ['', Validators.required],
      eventType: [null, Validators.required],
      startDate: [null, [Validators.required, futureDateValidator()]],
      startTime: [null, Validators.required],
      endingDate: [null, Validators.required],
      endingTime: [null],
      eventVisibility: [null, Validators.required],
      venueName: ['', Validators.required],
      venueAddress: [''],
      city: [null, Validators.required],
      ageRestriction: [null, Validators.required]
    }, { validators: dateRangeValidator });
  }

  loadEvent(id: string): void {
    this.loadingEvent = true;
    this.profileService.getEventById(id).pipe(
      tap((response) => {
        if (response.data) {
          this.event = response.data;
          this.populateForm(this.event);
          this.loadingEvent = false;
        }
      }),
      catchError((error) => {
        console.error('Error fetching event:', error);
        Notiflix.Notify.failure('Error fetching event details');
        this.loadingEvent = false;
        return of(null);
      })
    ).subscribe();
  }

  populateForm(event: IEvent): void {
    const startDate = event.startDate ? new Date(event.startDate) : null;
    const endingDate = event.endingDate ? new Date(event.endingDate) : null;
    
    let startTime = null;
    let endingTime = null;
    
   if (typeof event.startTime === 'string') {
      if (event.startTime.includes('GMT')) {
        startTime = new Date(event.startTime);
      } else {
        const today = new Date();
        const [hours, minutes] = event.startTime.split(':');
        today.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
        startTime = today;
      }
    }
    
    if (typeof event.endingTime === 'string') {
      if (event.endingTime.includes('GMT')) {
        endingTime = new Date(event.endingTime);
      } else {
        const today = new Date();
        const [hours, minutes] = event.endingTime.split(':');
        today.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
        endingTime = today;
      }
    }
    
    this.eventForm.patchValue({
      eventTitle: event.eventTitle,
      eventDescription: event.eventDescription,
      eventType: event.eventType,
      startDate: startDate,
      startTime: startTime,
      endingDate: endingDate,
      endingTime: endingTime,
      eventVisibility: event.eventVisibility,
      venueName: event.venueName,
      venueAddress: event.venueAddress,
      city: event.city,
      ageRestriction: event.ageRestriction
    });

    if (event.tickets && event.tickets.length > 0) {
      this.ticketsList = event.tickets.map(ticket => ({
        type: ticket.type,
        price: ticket.price,
        quantity: ticket.quantity
      }));
    }

    if (event.mainBanner) {
      this.mainBannerPreview = event.mainBanner;
    }
    
    if (event.promotionalImage) {
      this.promotionalImagePreview = event.promotionalImage;
    }
  }

  addTicketType(): void {
    if (this.currentTicketType && 
        this.currentTicketPrice !== null && 
        this.currentTicketPrice > 0 &&
        this.currentTicketQuantity > 0) {
      
      const existingTicketIndex = this.ticketsList.findIndex(
        ticket => ticket.type === this.currentTicketType
      );
      
      if (existingTicketIndex >= 0) {
        // Update existing ticket
        this.ticketsList[existingTicketIndex].quantity += this.currentTicketQuantity;
      } else {
        // Add new ticket type
        this.ticketsList.push({
          type: this.currentTicketType,
          price: this.currentTicketPrice,
          quantity: this.currentTicketQuantity
        });
      }
      
      this.currentTicketType = null;
      this.currentTicketPrice = null;
      this.currentTicketQuantity = 0;
    }
  }

  removeTicketType(index: number) {
    this.ticketsList.splice(index, 1);
  }

  getTotalTickets(): number {
    return this.ticketsList.reduce((total, ticket) => total + ticket.quantity, 0);
  }

  uploadMainBanner(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.mainBannerFile = file;
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.mainBannerPreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  }

  uploadPromotionalImage(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.promotionalImageFile = file;
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.promotionalImagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.eventForm.get(controlName);
    return control ? control.touched && control.hasError(errorName) : false;
  }

  submitForm(): void {
    if (this.eventForm.invalid) {
      Object.keys(this.eventForm.controls).forEach(key => {
        this.eventForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    if (this.ticketsList.length === 0) {
      Notiflix.Notify.info('Please add at least one ticket type');
      return;
    }
    
    this.loading = true;
    
    const formData = new FormData();
    
    Object.keys(this.eventForm.value).forEach(key => {
      formData.append(key, this.eventForm.value[key]);
    });
    
    formData.append('tickets', JSON.stringify(this.ticketsList));
    
    if (this.mainBannerFile) {
      formData.append('mainBanner', this.mainBannerFile);
    }
    
    if (this.promotionalImageFile) {
      formData.append('promotionalImage', this.promotionalImageFile);
    }

    if (!this.eventId) {
      Notiflix.Notify.failure('Event ID is missing');
      this.loading = false;
      return;
    }

    this.profileService.updateEvent(this.eventId, formData).subscribe({
      next: (response) => {
        this.loading = false;
        Notiflix.Notify.success('Event updated successfully!');
        this.router.navigate(['/profile/events']);
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Event update error:', error);
        Notiflix.Notify.failure('Failed to update event. Please try again.');
      }
    });
  }

  cancelEdit(): void {
    this.router.navigate(['/profile/events']);
  }
}
