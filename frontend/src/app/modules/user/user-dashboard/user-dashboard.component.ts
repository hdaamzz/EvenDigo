import { trigger, state, style, transition, animate } from '@angular/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
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
import { catchError, Observable, of, tap } from 'rxjs';
import { cities } from '../../../helpers/helpers';
import { UserNavComponent } from "../../../shared/user-nav/user-nav.component";
import { Store } from '@ngrx/store';
import { AuthState, User } from '../../../core/models/userModel';
import { selectUser } from '../../../core/store/auth/auth.selectors';

interface AppState {
  auth: AuthState;
}

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

  //user credentials
  user$: Observable<User | null>;
  currentUser: User | null = null;
  isUserVerified: boolean = false;


  //event list 
  eventList:IEvent[] | undefined=[]
  eventLoading=false;
  selectedEvent!:IEvent;
  filters: string[] = ["Category", "Type", "Custom", "Filter"];
  isOpen = false;

  //event form 
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


  //event success
  successDialogVisible: boolean = false;
  createdEvent: IEvent | null = null;


  constructor(
    private fb: FormBuilder,
    private dashboardService: UserDashboardService,
    private store: Store<AppState>
  ) {
      this.user$ = this.store.select(selectUser);
      console.log(this.user$);
  }


  ngOnInit(): void {
    this.user$
      .pipe(
        tap(user => {
          this.currentUser = user;
          this.isUserVerified = user?.verified || false;
          console.log('User verified status:', this.isUserVerified);
        })
      )
      .subscribe();
    this.fetchAllEvents();
    this.initForm();
  }

  tabChange(tab: string) {
    this.tabSwitch = (tab === 'participated');
  }

  showDialog() {
    if (!this.currentUser) {
      Notiflix.Notify.failure('You must be logged in to create an event');
      return;
    }
    
    if (!this.isUserVerified) {
      Notiflix.Notify.info('You Need To Verify Before Creating Events , Update Your Details In Profile Section');
      return;
    }
    
    this.visible = true;
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
        this.initForm()
        this.loading = false;
        this.visible = false;
        this.promotionalImageFile=null;
        this.promotionalImagePreview=null;
        this.mainBannerPreview = null;
        this.mainBannerFile = null
        this.currentTicketType = '';
        this.currentTicketPrice= null;
        this.currentTicketQuantity = 0;
        this.ticketsList= [];
        if (response.data) {
        this.createdEvent = response.data;
        this.successDialogVisible = true;
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

  // showEventDetails(id:string){
  //   this.dashboardService.getEventById(id).pipe(
  //     tap((response) => {
  //       if(response.data){
  //         this.selectedEvent = response.data;
  //         this.displayEventDialog = true;
  //       }
  //     }),
  //     catchError((error) => {
  //       console.error('Error fetching users:', error);
  //       Notiflix.Notify.failure('Error fetching users');
  //       return of(null);
  //     })
  //   ).subscribe();
  // }

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
