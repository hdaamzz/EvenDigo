import { trigger, state, style, transition, animate } from '@angular/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select'; 
import { InputNumberModule } from 'primeng/inputnumber';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { UserDashboardService } from '../../../core/services/user/dashboard/user.dashboard.service';
import Notiflix from 'notiflix';
import { dateRangeValidator, futureDateValidator } from '../../../validators/formValidators';
import { IEvent } from '../../../core/models/event.interface';
import { catchError, of, tap } from 'rxjs';
import { cities } from '../../../helpers/helpers';
import { UserNavComponent } from "../../../shared/user-nav/user-nav.component";


interface TicketItem {
  type: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-user-dashboard',
  imports: [CommonModule, RouterModule, FormsModule, SelectModule, DatePickerModule, InputNumberModule, ReactiveFormsModule, Dialog, ButtonModule, InputTextModule, UserNavComponent],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css',
  animations: [
    trigger('fadeAnimation', [
      state('participated', style({
        opacity: 1
      })),
      state('organized', style({
        opacity: 1
      })),
      transition('participated <=> organized', [
        style({ opacity: 0 }),
        animate('300ms ease-in-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class UserDashboardComponent implements OnInit {
  eventList:IEvent[]=[]
  eventLoading=false;
  selectedEvent!:IEvent;
  filters: string[] = ["Category", "Type", "Custom", "Filter"];
  isOpen = false;
  eventForm!: FormGroup;
  mainBannerPreview: string | null = null;
  promotionalImagePreview: string | null = null;
  eventTypes = [
    { label: 'Conference', value: 'Conference' },
    { label: 'Concert', value: 'Concert' },
    { label: 'Workshop', value: 'Workshop' },
    { label: 'Exhibition', value: 'Exhibition' },
    { label: 'Meetup', value: 'Meetup' },
    { label: 'Party', value: 'Party' }
  ];  
  visibilityOptions = [
    { label: 'Public', value: 'Public' },
    { label: 'Private', value: 'Private' }
  ];
  tabSwitch: boolean = true;
  cities=cities;
  displayEventDialog:boolean=false;
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

  showDialog() {
    this.visible = true;
  }

  constructor(
    private fb: FormBuilder,
    private dashboardService: UserDashboardService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.fetchAllEvents();
    this.initForm();
  }
  tabChange(tab: string) {
    this.tabSwitch = (tab === 'participated');
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


  addTicketType(): void {
    if (this.currentTicketType && 
        this.currentTicketPrice !== null && 
        this.currentTicketPrice > 0 &&
        this.currentTicketQuantity > 0) {
      
      // Check if this ticket type already exists
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

  openModal(): void {
    this.isOpen = true;
    document.body.classList.add('overflow-hidden');
  }

  closeModal(): void {
    this.isOpen = false;
    document.body.classList.remove('overflow-hidden');
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

 
  submitForm(): void {
    if (this.eventForm.invalid) {
      // Mark all fields as touched to trigger validation messages
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
    
    // Create form data for file uploads
    const formData = new FormData();
    
    // Add form values
    Object.keys(this.eventForm.value).forEach(key => {
      formData.append(key, this.eventForm.value[key]);
    });
    
    // Add tickets as JSON string
    formData.append('tickets', JSON.stringify(this.ticketsList));
    
    // Add files
    if (this.mainBannerFile) {
      formData.append('mainBanner', this.mainBannerFile);
    }
    
    if (this.promotionalImageFile) {
      formData.append('promotionalImage', this.promotionalImageFile);
    }

    
    this.dashboardService.createEvent(formData).subscribe({
      next: (response: void) => {
        this.loading = false;
        this.isOpen = false;
        document.body.classList.remove('overflow-hidden');
        this.initForm()
        Notiflix.Notify.success('Event created successfully!')
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Event creation error:', error);
        Notiflix.Notify.failure('Failed to create event. Please try again.');
      }
    });
  }
  
  fetchAllEvents() {
    this.eventLoading = true;
    this.dashboardService.getUserEvents().pipe(
      tap((response) => {
          this.eventList = response.data;
          this.eventLoading=false;
          
      }),
      catchError((error) => {
        console.error('Error fetching users:', error);
        Notiflix.Notify.failure('Error fetching users');
        return of(null);
      })
    ).subscribe();
  }
  getLowestTicketPrice(event: IEvent): number {
    if (!event.tickets || event.tickets.length === 0) {
      return 0;
    }
    
    return Math.min(...event.tickets.map(ticket => ticket.price));
  }

  showEventDetails(id:string){
    this.dashboardService.getEventById(id).pipe(
      tap((response) => {
          this.selectedEvent = response.data;
          this.displayEventDialog = true;
          
      }),
      catchError((error) => {
        console.error('Error fetching users:', error);
        Notiflix.Notify.failure('Error fetching users');
        return of(null);
      })
    ).subscribe();
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
  purchaseTickets(item:IEvent){}
}
