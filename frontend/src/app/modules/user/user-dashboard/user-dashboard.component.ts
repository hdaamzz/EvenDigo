import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { UserDashboardService } from '../../../core/services/user/dashboard/user.dashboard.service';
import Notiflix from 'notiflix';
import { IEvent } from '../../../core/models/event.interface';
import { catchError, Observable, of, tap } from 'rxjs';
import { UserNavComponent } from '../../../shared/user-nav/user-nav.component';
import { Store } from '@ngrx/store';
import { AuthState, User } from '../../../core/models/userModel';
import { selectUser } from '../../../core/store/auth/auth.selectors';
import { EventCreationComponent } from '../event-creation/event-creation.component';
import { trigger, state, style, transition, animate } from '@angular/animations';

interface AppState {
  auth: AuthState;
}

@Component({
  selector: 'app-user-dashboard',
  imports: [CommonModule,
    RouterModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    UserNavComponent,
    EventCreationComponent],
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
  user$: Observable<User | null>;
  currentUser: User | null = null;
  isUserVerified: boolean = false;
  eventList: IEvent[] | undefined = [];
  eventLoading = false;
  selectedEvent!: IEvent;
  filters: string[] = ["Category", "Type", "Custom", "Filter"];
  tabSwitch: boolean = true;
  displayEventDialog: boolean = false;

  constructor(
    private dashboardService: UserDashboardService,
    private store: Store<AppState>
  ) {
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {
    this.user$
      .pipe(
        tap(user => {
          this.currentUser = user;
          console.log(this.currentUser);
          
          this.isUserVerified = user?.status=="active"  || false;
        })
      )
      .subscribe();
    this.fetchAllEvents();
  }

  tabChange(tab: string) {
    this.tabSwitch = (tab === 'participated');
  }

  fetchAllEvents() {
    this.eventLoading = true;
    this.dashboardService.getUserEvents().pipe(
      tap((response) => {
        this.eventList = response.data;
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
}