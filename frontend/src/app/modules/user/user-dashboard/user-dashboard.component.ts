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
  imports: [CommonModule,
    RouterModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    UserNavComponent,
    EventCreationComponent, 
    EventCardComponent],
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
    trigger('tabAnimation', [
      state('active', style({ 
        transform: 'scale(1.05)',
        backgroundColor: '#065f46'
      })),
      state('inactive', style({ 
        transform: 'scale(1)',
        backgroundColor: '#1f2937'
      })),
      transition('active <=> inactive', animate('200ms ease-in-out'))
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
            Notiflix.Notify.failure('Failed to load your events.');
          }
        },
        error: (error) => {
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
            Notiflix.Notify.failure('Failed to load ongoing events.');
          }
        },
        error: (error) => {
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
  }
  

  fetchAllEvents() {
    this.eventLoading = true;
    this.dashboardService.getUserEvents().pipe(
      tap((response) => {
        this.events = response.data;
        this.eventLoading = false;
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

  purchaseTickets(item: IEvent) {}

  fetchAllParticipatedEvents() {
    this.eventLoading = true;
    this.dashboardService.getUserParticipatedEvents().pipe(
      tap((response) => {        
        this.eventParticipatedList = response.data;
        this.eventLoading = false;
      }),
      catchError((error) => {
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
}