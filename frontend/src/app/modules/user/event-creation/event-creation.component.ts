import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import Notiflix from 'notiflix';
import { dateRangeValidator, futureDateValidator } from '../../../validators/formValidators';
import { IEvent } from '../../../core/models/event.interface';
import { UserDashboardService } from '../../../core/services/user/dashboard/user.dashboard.service';
import { cities } from '../../../helpers/helpers';
import { TicketItem } from '../../../core/interfaces/user/event';

@Component({
  selector: 'app-event-creation',
  imports: [CommonModule,ReactiveFormsModule,FormsModule,ButtonModule, DialogModule,InputTextModule,SelectModule,DatePickerModule,InputNumberModule],
  templateUrl: './event-creation.component.html',
  styleUrl: './event-creation.component.css'
})
export class EventCreationComponent implements OnInit {
  @Input() currentUser: any | null = null;
  @Input() isUserVerified: boolean = false;
  @Output() onEventCreated = new EventEmitter<IEvent>();

  eventForm!: FormGroup;
  mainBannerPreview: string | null = null;
  promotionalImagePreview: string | null = null;
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
  cities = cities;
  visible: boolean = false;
  availableTicketTypes = [
    { label: 'Regular', value: 'Regular' },
    { label: 'VIP', value: 'VIP' },
    { label: 'Gold', value: 'Gold' }
  ];
  currentTicketType: string | null = '';
  currentTicketPrice: number | null = null;
  currentTicketQuantity: number = 0;
  ticketsList: TicketItem[] = [];
  ageRestrictionOptions = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' }
  ];
  mainBannerFile: File | null = null;
  promotionalImageFile: File | null = null;
  loading = false;
  today = new Date();
  successDialogVisible: boolean = false;
  createdEvent: IEvent | null = null;

  constructor(
    private fb: FormBuilder,
    private dashboardService: UserDashboardService
  ) {}

  ngOnInit(): void {
    this.initForm();
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

  showDialog() {
    if (!this.currentUser) {
      Notiflix.Notify.failure('You must be logged in to create an event');
      return;
    }
    if (!this.isUserVerified) {
      Notiflix.Notify.info('You Need To Verify Before Creating Events, Update Your Details In Profile Section');
      return;
    }
    this.visible = true;
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

  hasError(controlName: string, errorName: string): boolean {
    const control = this.eventForm.get(controlName);
    return control ? control.touched && control.hasError(errorName) : false;
  }

  uploadMainBanner(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.mainBannerFile = file;
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
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.promotionalImagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
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
    if (!this.mainBannerFile) {
      Notiflix.Notify.info('Please upload a main banner image');
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
    this.dashboardService.createEvent(formData).subscribe({
      next: (response) => {
        this.initForm();
        this.loading = false;
        this.visible = false;
        this.promotionalImageFile = null;
        this.promotionalImagePreview = null;
        this.mainBannerPreview = null;
        this.mainBannerFile = null;
        this.currentTicketType = '';
        this.currentTicketPrice = null;
        this.currentTicketQuantity = 0;
        this.ticketsList = [];
        if (response.data) {
          this.createdEvent = response.data;
          this.successDialogVisible = true;
          this.onEventCreated.emit(response.data);
        }
        Notiflix.Notify.success('Event created successfully!');
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Event creation error:', error);
        Notiflix.Notify.failure('Failed to create event. Please try again.');
      }
    });
  }
}
