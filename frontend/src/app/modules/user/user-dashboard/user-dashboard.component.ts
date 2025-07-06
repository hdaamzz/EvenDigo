import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { UserDashboardService } from '../../../core/services/user/dashboard/user.dashboard.service';
import Notiflix from 'notiflix';
import { CardIEvent, IEvent } from '../../../core/models/event.interface';
import { catchError, Observable, of, tap } from 'rxjs';
import { UserNavComponent } from '../../../shared/user-nav/user-nav.component';
import { Store } from '@ngrx/store';
import { AuthState, User } from '../../../core/models/userModel';
import { selectUser } from '../../../core/store/auth/auth.selectors';
import { EventCreationComponent } from '../event-creation/event-creation.component';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';
import { EventCardComponent } from "./event-card/event-card.component";
import { AppState } from '../../../core/interfaces/user/profile';

@Component({
  selector: 'app-user-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    UserNavComponent,
    EventCreationComponent, 
    EventCardComponent
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ opacity: 0, transform: 'translateY(-30px)' }))
      ])
    ]),
    trigger('fadeSlide', [
      state('participated', style({ opacity: 1, transform: 'translateX(0)' })),
      state('organized', style({ opacity: 1, transform: 'translateX(0)' })),
      state('ongoing', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('* => *', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate('350ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('tabSlide', [
      transition('* => *', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('cardStagger', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(50px) scale(0.8)' }),
          stagger(100, [
            animate('500ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
              style({ opacity: 1, transform: 'translateY(0) scale(1)' })
            )
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class UserDashboardComponent implements OnInit {
  @ViewChild(EventCardComponent) eventCardComponent!: EventCardComponent;
   
  user$: Observable<User | null>;
  currentUser: User | null = null;
  isUserVerified: boolean = false;
  eventOrganizedList: CardIEvent[] | undefined = [];
  eventParticipatedList: CardIEvent[] | undefined = [];
  ongoingEventsList: CardIEvent[] | undefined = [];
  eventLoading = false;
  selectedEvent!: CardIEvent;
  filters: string[] = ["Category", "Type", "Custom", "Filter"];
  activeTab: 'participated' | 'organized' | 'ongoing' = 'participated';
  displayEventDialog: boolean = false;
  searchQuery: string = '';
  selectedFilter: string = 'newest';
  
  // Mobile navigation state
  isMobileMenuOpen: boolean = false;

  constructor(
    private dashboardService: UserDashboardService,
    private store: Store<AppState>
  ) {
    this.user$ = this.store.select(selectUser);
  }

  private _loadUserOrganizedEvents(): void {
    this.eventLoading = true;
    this.dashboardService.getUserOrganizedEvents()
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.eventLoading = false;
            this.eventOrganizedList = response.data;
          } else {
            this.eventLoading = false;
            Notiflix.Notify.failure('Failed to load your events.');
          }
        },
        error: (error) => {
          this.eventLoading = false;
          console.error('Error loading events:', error);
          Notiflix.Notify.failure('Error loading your events.');
        },
      });
  }

  private _loadOngoingEvents(): void {
    this.eventLoading = true;
    this.dashboardService.getOngoingEvents()
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.eventLoading = false;
            this.ongoingEventsList = response.data;
          } else {
            this.eventLoading = false;
            Notiflix.Notify.failure('Failed to load ongoing events.');
          }
        },
        error: (error) => {
          this.eventLoading = false;
          console.error('Error loading ongoing events:', error);
          Notiflix.Notify.failure('Error loading ongoing events.');
        },
      });
  }

  events: IEvent[] | undefined;

  ngOnInit(): void {
    this.user$
      .pipe(
        tap(user => {
          this.currentUser = user;          
          this.isUserVerified = user?.status == "active" || false;
        })
      )
      .subscribe();
    this.fetchAllEvents();
    this._loadUserOrganizedEvents();
    this.fetchAllParticipatedEvents();
    this._loadOngoingEvents();
  }

  tabChange(tab: 'participated' | 'organized' | 'ongoing') {    
    this.activeTab = tab;
    this.isMobileMenuOpen = false; // Close mobile menu on tab change
    
    // Add haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  fetchAllEvents() {
    this.eventLoading = true;
    this.dashboardService.getUserEvents().pipe(
      tap((response) => {
        this.events = response.data;
        this.eventLoading = false;
      }),
      catchError((error) => {
        this.eventLoading = false;
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

  purchaseTickets(item: IEvent) {
    // Implementation for ticket purchase
  }

  fetchAllParticipatedEvents() {
    this.eventLoading = true;
    this.dashboardService.getUserParticipatedEvents().pipe(
      tap((response) => {        
        this.eventParticipatedList = response.data;
        this.eventLoading = false;
      }),
      catchError((error) => {
        this.eventLoading = false;
        console.error('Error fetching users:', error);
        Notiflix.Notify.failure('Error fetching users');
        return of(null);
      })
    ).subscribe();
  }

  getCurrentEventList(): CardIEvent[] | undefined {
    switch (this.activeTab) {
      case 'participated':
        return this.eventParticipatedList;
      case 'organized':
        return this.eventOrganizedList;
      case 'ongoing':
        return this.ongoingEventsList;
      default:
        return [];
    }
  }

  getTabTitle(): string {
    switch (this.activeTab) {
      case 'participated':
        return 'Participated Events';
      case 'organized':
        return 'Organized Events';
      case 'ongoing':
        return 'Ongoing Events';
      default:
        return '';
    }
  }

  getTabDescription(): string {
    switch (this.activeTab) {
      case 'participated':
        return 'Events you have joined or attended';
      case 'organized':
        return 'Events you have created and organized';
      case 'ongoing':
        return 'Currently active events happening now';
      default:
        return '';
    }
  }

  getTabIcon(): string {
    switch (this.activeTab) {
      case 'participated':
        return 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z';
      case 'organized':
        return 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4';
      case 'ongoing':
        return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return '';
    }
  }

  getEventCount(): number {
    return this.getCurrentEventList()?.length || 0;
  }
}