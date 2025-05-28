import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, catchError, of, takeUntil, tap } from 'rxjs';
import Notiflix from 'notiflix';

import { UserExploreService } from '../../../core/services/user/explore/user.explore.service';
import { IEvent } from '../../../core/models/event.interface';
import { TruncatePipe } from '../../../core/pipes/truncate.pipe';
import { EventDetailModalComponent } from './event-detail-modal/event-detail-modal.component';
import { UserNavComponent } from "../../../shared/user-nav/user-nav.component";

@Component({
  selector: 'app-user-explore',
  standalone: true,
  imports: [CommonModule, RouterModule, TruncatePipe, EventDetailModalComponent, UserNavComponent],
  templateUrl: './user-explore.component.html',
  styleUrls: ['./user-explore.component.css']
})
export class UserExploreComponent implements OnInit, OnDestroy {

  eventList: IEvent[] = [];
  isLoading = false;
  selectedEventId: string | null = null;
  isModalOpen = false;

  private readonly _destroy$ = new Subject<void>();

  constructor(private readonly _exploreService: UserExploreService) { }

  ngOnInit(): void {
    this._fetchAllEvents();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  getLowestTicketPrice(event: IEvent): number {
    if (!event.tickets || event.tickets.length === 0) {
      return 0;
    }
    return Math.min(...event.tickets.map(ticket => ticket.price));
  }

  showEventDetails(eventId: string): void {
    this.selectedEventId = eventId;
    this.isModalOpen = true;
  }

  closeModal = (): void => {
    this.isModalOpen = false;
    this.selectedEventId = null;
  }

  private _fetchAllEvents(): void {
    this.isLoading = true;

    this._exploreService.getAllEvents()
      .pipe(
        tap((response) => {
          if (response.data) {
            this.eventList = response.data;
          }
        }),
        catchError((error) => {
          console.error('Error fetching events:', error);
          Notiflix.Notify.failure('Error fetching events');
          return of(null);
        }),
        takeUntil(this._destroy$),
        tap(() => this.isLoading = false)
      )
      .subscribe();
  }
  onChatWithOrganizer($event: string) {
    throw new Error('Method not implemented.');
  }
}