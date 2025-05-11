import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { catchError, finalize, of, Subject, takeUntil, tap } from 'rxjs';

interface TicketItem {
  type: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-event-edit',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    DatePickerModule, 
    SelectModule, 
    InputNumberModule, 
    ButtonModule, 
    InputTextModule,
    UserNavComponent
  ],
  templateUrl: './event-edit.component.html',
  styleUrl: './event-edit.component.css'
})
export class EventEditComponent implements OnInit, OnDestroy {
  private readonly _destroy$ = new Subject<void>();
  private _eventId: string | null = null;
  private _mainBannerFile: File | null = null;
  private _promotionalImageFile: File | null = null;

  eventForm!: FormGroup;
  event: IEvent | null = null;
  isLoading = false;
  isLoadingEvent = false;

  mainBannerPreview: string | null = null;
  promotionalImagePreview: string | null = null;
  
  currentTicketType: string | null = '';
  currentTicketPrice: number | null = null;
  currentTicketQuantity = 0;
  ticketsList: TicketItem[] = [];

  readonly today = new Date();
  
  readonly eventTypes = [
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
  
  readonly visibilityOptions = [
    { label: 'Public', value: 'Public' },
    { label: 'Private', value: 'Private' }
  ];
  
  readonly cities = [
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
  
  readonly availableTicketTypes = [
    { label: 'Regular', value: 'Regular' },
    { label: 'VIP', value: 'VIP' },
    { label: 'Gold', value: 'Gold' }
  ];
  
  readonly ageRestrictionOptions = [
    { label: 'Yes', value: 'true' },
    { label: 'No', value: 'false' }
  ];

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _fb: FormBuilder,
    private _profileService: UserProfileService
  ) {}

  ngOnInit(): void {
    this._initForm();
    this._route.params
      .pipe(takeUntil(this._destroy$))
      .subscribe(params => {
        this._eventId = params['id'];
        if (this._eventId) {
          this._loadEvent(this._eventId);
        }
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _initForm(): void {
    this.eventForm = this._fb.group({
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

  private _loadEvent(id: string): void {
    this.isLoadingEvent = true;
    this._profileService.getEventById(id)
      .pipe(
        takeUntil(this._destroy$),
        tap((response) => {
          if (response.data) {
            this.event = response.data;
            this._populateForm(this.event);
          }
        }),
        catchError((error) => {
          console.error('Error fetching event:', error);
          Notiflix.Notify.failure('Error fetching event details');
          return of(null);
        }),
        finalize(() => this.isLoadingEvent = false)
      )
      .subscribe();
  }

  private _populateForm(event: IEvent): void {
    const startDate = event.startDate ? new Date(event.startDate) : null;
    const endingDate = event.endingDate ? new Date(event.endingDate) : null;
    
    const startTime = this._parseTimeString(event.startTime);
    const endingTime = this._parseTimeString(event.endingTime);
    
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

  private _parseTimeString(timeString: string | undefined): Date | null {
    if (!timeString) return null;
    
    if (timeString.includes('GMT')) {
      return new Date(timeString);
    } else {
      const today = new Date();
      const [hours, minutes] = timeString.split(':');
      today.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
      return today;
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
        this.ticketsList[existingTicketIndex].quantity += this.currentTicketQuantity;
      } else {
        this.ticketsList.push({
          type: this.currentTicketType,
          price: this.currentTicketPrice,
          quantity: this.currentTicketQuantity
        });
      }
      
      this._resetTicketForm();
    }
  }

  private _resetTicketForm(): void {
    this.currentTicketType = null;
    this.currentTicketPrice = null;
    this.currentTicketQuantity = 0;
  }

  removeTicketType(index: number): void {
    this.ticketsList.splice(index, 1);
  }

  getTotalTickets(): number {
    return this.ticketsList.reduce((total, ticket) => total + ticket.quantity, 0);
  }

  uploadMainBanner(): void {
    this._createFileInput('image/*', (file: File) => {
      this._mainBannerFile = file;
      this._createImagePreview(file, (preview: string) => {
        this.mainBannerPreview = preview;
      });
    });
  }

  uploadPromotionalImage(): void {
    this._createFileInput('image/*', (file: File) => {
      this._promotionalImageFile = file;
      this._createImagePreview(file, (preview: string) => {
        this.promotionalImagePreview = preview;
      });
    });
  }

  private _createFileInput(accept: string, onFileSelected: (file: File) => void): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = accept;
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        onFileSelected(file);
      }
    };
    fileInput.click();
  }

  private _createImagePreview(file: File, callback: (preview: string) => void): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      callback(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.eventForm.get(controlName);
    return control ? control.touched && control.hasError(errorName) : false;
  }

  submitForm(): void {
    if (this.eventForm.invalid) {
      this._markFormGroupTouched(this.eventForm);
      return;
    }
    
    if (this.ticketsList.length === 0) {
      Notiflix.Notify.info('Please add at least one ticket type');
      return;
    }
    
    if (!this._eventId) {
      Notiflix.Notify.failure('Event ID is missing');
      return;
    }

    this.isLoading = true;
    const formData = this._prepareFormData();
    
    this._profileService.updateEvent(this._eventId, formData)
      .pipe(
        takeUntil(this._destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => {
          Notiflix.Notify.success('Event updated successfully!');
          this._router.navigate(['/profile/events']);
        },
        error: (error: any) => {
          console.error('Event update error:', error);
          Notiflix.Notify.failure('Failed to update event. Please try again.');
        }
      });
  }

  private _markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.markAsTouched();
    });
  }

  private _prepareFormData(): FormData {
    const formData = new FormData();
    
    Object.keys(this.eventForm.value).forEach(key => {
      const value = this.eventForm.value[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    
    formData.append('tickets', JSON.stringify(this.ticketsList));
    
    if (this._mainBannerFile) {
      formData.append('mainBanner', this._mainBannerFile);
    }
    
    if (this._promotionalImageFile) {
      formData.append('promotionalImage', this._promotionalImageFile);
    }

    return formData;
  }

  cancelEdit(): void {
    this._router.navigate(['/profile/events']);
  }
}