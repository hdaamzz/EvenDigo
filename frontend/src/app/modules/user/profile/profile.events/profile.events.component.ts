import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subject, catchError, finalize, of, takeUntil, tap } from "rxjs";
import Notiflix from "notiflix";

import { IEvent } from "../../../../core/models/event.interface";
import { UserProfileService } from "../../../../core/services/user/profile/user.profile.service";
import { FormsModule } from "@angular/forms";

interface GroupedEvents {
  date: string;
  displayDate: string;
  events: IEvent[];
}

@Component({
  selector: 'app-profile-events',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './profile.events.component.html',
  styleUrl: './profile.events.component.css'
})
export class ProfileEventsComponent implements OnInit, OnDestroy {
  private readonly _destroy$ = new Subject<void>();
  
  events: IEvent[] = [];
  groupedEvents: GroupedEvents[] = [];
  isLoadingEvents = false;
  isLoadingMore = false;
  selectedEventId: string | null = null; 
  isDeleteConfirmDialogVisible = false;
  eventToDeleteId: string | null = null;

  currentPage = 1;
  hasMore = true;
  limit = 10;

  constructor(
    private _profileService: UserProfileService,
    private _router: Router
  ) {}
  
  ngOnInit(): void {
    this._fetchEvents();
    this._setupInfiniteScroll();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _fetchEvents(page: number = 1): void {
    if (page === 1) {
      this.isLoadingEvents = true;
      this.events = []; 
    } else {
      this.isLoadingMore = true;
    }

    this._profileService.getUserEvents(page, this.limit)
      .pipe(
        takeUntil(this._destroy$),
        tap((response) => {
          if (response.data) {
            if (page === 1) {
              this.events = response.data.events;
            } else {
              this.events = [...this.events, ...response.data.events];
            }
            this.currentPage = response.data.currentPage;
            this.hasMore = response.data.hasMore;
            this._groupEventsByCreationDate();
          }
        }),
        catchError((error) => {
          console.error('Error fetching events:', error);
          Notiflix.Notify.failure('Error fetching events');
          return of(null);
        }),
        finalize(() => {
          this.isLoadingEvents = false;
          this.isLoadingMore = false;
        })
      )
      .subscribe();
  }

  private _groupEventsByCreationDate(): void {
    const grouped = new Map<string, IEvent[]>();
    
    this.events.forEach(event => {
      const createdDate = new Date(event.createdAt);
      const dateKey = createdDate.toISOString().split('T')[0];
      
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(event);
    });
    
    this.groupedEvents = Array.from(grouped.entries())
      .map(([dateKey, events]) => ({
        date: dateKey,
        displayDate: this._formatDisplayDate(dateKey),
        events: events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  private _formatDisplayDate(dateKey: string): string {
    const date = new Date(dateKey);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  }

  trackByDate(index: number, group: GroupedEvents): string {
    return group.date;
  }

  trackByEventId(index: number, event: IEvent): string {
    return event._id;
  }

  // ... rest of your existing methods remain the same
  private _setupInfiniteScroll(): void {
    const scrollHandler = () => {
      if (this.isLoadingMore || !this.hasMore) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= documentHeight - 200) {
        this._loadMoreEvents();
      }
    };
    
    window.addEventListener('scroll', scrollHandler);
    
    this._destroy$.subscribe(() => {
      window.removeEventListener('scroll', scrollHandler);
    });
  }

  private _loadMoreEvents(): void {
    if (this.hasMore && !this.isLoadingMore) {
      this._fetchEvents(this.currentPage + 1);
    }
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
          this.currentPage = 1;
          this.hasMore = true;
          this._fetchEvents(1); 
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
