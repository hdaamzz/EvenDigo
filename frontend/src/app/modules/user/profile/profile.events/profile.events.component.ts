import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subject, catchError, finalize, of, takeUntil, tap } from "rxjs";
import Notiflix from "notiflix";

import { IEvent } from "../../../../core/models/event.interface";
import { UserProfileService } from "../../../../core/services/user/profile/user.profile.service";

@Component({
  selector: 'app-profile-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.events.component.html',
  styleUrl: './profile.events.component.css'
})
export class ProfileEventsComponent implements OnInit, OnDestroy {
  private readonly _destroy$ = new Subject<void>();
  
  events: IEvent[] = [];
  isLoadingEvents = false;
  selectedEventId: string | null = null; 
  isDeleteConfirmDialogVisible = false;
  eventToDeleteId: string | null = null;

  constructor(
    private _profileService: UserProfileService,
    private _router: Router
  ) {}
  
  ngOnInit(): void {
    this._fetchEvents();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _fetchEvents(): void {
    this.isLoadingEvents = true;
    
    this._profileService.getUserEvents()
      .pipe(
        takeUntil(this._destroy$),
        tap((response) => {
          if (response.data) {
            this.events = response.data;
          }
        }),
        catchError((error) => {
          console.error('Error fetching events:', error);
          Notiflix.Notify.failure('Error fetching events');
          return of(null);
        }),
        finalize(() => this.isLoadingEvents = false)
      )
      .subscribe();
  }
  
  editEvent(eventId: string): void {
    this._router.navigate(['/profile/edit-event', eventId]);
  }

  confirmDelete(eventId: string): void {
    this.eventToDeleteId = eventId;
    this.isDeleteConfirmDialogVisible = true;
  }

  cancelDelete(): void {
    this.eventToDeleteId = null;
    this.isDeleteConfirmDialogVisible = false;
  }

  deleteEvent(): void {
    if (!this.eventToDeleteId) {
      return;
    }
    
    this._profileService.deleteEvent(this.eventToDeleteId)
      .pipe(
        takeUntil(this._destroy$),
        tap(() => {
          Notiflix.Notify.success('Event deleted successfully');
          this._resetDeleteState();
          this._fetchEvents();
        }),
        catchError((error) => {
          console.error('Error deleting event:', error);
          Notiflix.Notify.failure('Failed to delete event');
          return of(null);
        })
      )
      .subscribe();
  }

  private _resetDeleteState(): void {
    this.eventToDeleteId = null;
    this.isDeleteConfirmDialogVisible = false;
  }
}