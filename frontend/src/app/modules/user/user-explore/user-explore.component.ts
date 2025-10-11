import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, catchError, of, takeUntil, tap, debounceTime, distinctUntilChanged } from 'rxjs';
import Notiflix from 'notiflix';

import { UserExploreService } from '../../../core/services/user/explore/user.explore.service';
import { IEvent } from '../../../core/models/event.interface';
import { EventDetailModalComponent } from './event-detail-modal/event-detail-modal.component';
import { UserNavComponent } from "../../../shared/user-nav/user-nav.component";

@Component({
  selector: 'app-user-explore',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, EventDetailModalComponent, UserNavComponent],
  templateUrl: './user-explore.component.html',
  styleUrls: ['./user-explore.component.css']
})
export class UserExploreComponent implements OnInit, OnDestroy {
  @ViewChild('mobileSearchInput') mobileSearchInput!: ElementRef;
  @ViewChild('desktopSearchInput') desktopSearchInput!: ElementRef;

  eventList: IEvent[] = [];
  filteredEvents: IEvent[] = [];
  isLoading = false;
  selectedEventId: string | null = null;
  isModalOpen = false;
  isMobileFiltersOpen = false;

  // Search Properties
  searchQuery = '';
  selectedEventType = '';
  isMobileSearchExpanded = false;
  isDesktopSearchExpanded = false;
  searchAnimationState: 'collapsed' | 'expanding' | 'expanded' | 'collapsing' = 'collapsed';
  desktopSearchAnimationState: 'collapsed' | 'expanding' | 'expanded' | 'collapsing' = 'collapsed';

  // Pagination Properties
  currentPage = 1;
  pageSize = 12;
  totalEvents = 0;
  isLoadingMore = false;
  hasMoreEvents = true;
  allEventsLoaded = false;

  // Dropdown State
  isEventTypeDropdownOpen = false;

  private searchSubject = new Subject<string>();
  private readonly _destroy$ = new Subject<void>();

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

  constructor(private readonly _exploreService: UserExploreService) { }

  ngOnInit(): void {
    this._fetchAllEvents();
    this._setupSearchDebounce();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (this.isLoadingMore || !this.hasMoreEvents || this.allEventsLoaded) {
      return;
    }

    const threshold = 200;
    const position = window.pageYOffset + window.innerHeight;
    const height = document.documentElement.scrollHeight;

    if (position > height - threshold) {
      this.loadMoreEvents();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.closeEventTypeDropdown();
    }
  }

  // Search Methods
  toggleMobileSearch(): void {
  if (this.searchAnimationState === 'collapsed') {
    this.searchAnimationState = 'expanding';
    this.isMobileSearchExpanded = true;
    setTimeout(() => {
      this.searchAnimationState = 'expanded';
      this.mobileSearchInput?.nativeElement.focus();
    }, 50);
  }
}

 
toggleDesktopSearch(): void {
  if (this.desktopSearchAnimationState === 'collapsed') {
    this.desktopSearchAnimationState = 'expanding';
    this.isDesktopSearchExpanded = true;
    setTimeout(() => {
      this.desktopSearchAnimationState = 'expanded';
      this.desktopSearchInput?.nativeElement.focus();
    }, 50);
  }
}

 closeMobileSearch(): void {
  if (this.searchAnimationState === 'expanded') {
    this.searchAnimationState = 'collapsing';
    setTimeout(() => {
      this.isMobileSearchExpanded = false;
      this.searchAnimationState = 'collapsed';
    }, 300);
  }
}

closeDesktopSearch(): void {
  if (this.desktopSearchAnimationState === 'expanded') {
    this.desktopSearchAnimationState = 'collapsing';
    setTimeout(() => {
      this.isDesktopSearchExpanded = false;
      this.desktopSearchAnimationState = 'collapsed';
    }, 300);
  }
}

onMobileSearchBlur(): void {
  if (!this.searchQuery.trim() && this.searchAnimationState === 'expanded') {
    setTimeout(() => {
      this.closeMobileSearch();
    }, 200);
  }
}

onDesktopSearchBlur(): void {
  if (!this.searchQuery.trim() && this.desktopSearchAnimationState === 'expanded') {
    setTimeout(() => {
      this.closeDesktopSearch();
    }, 200);
  }
}

  onSearch(): void {
    this.searchSubject.next(this.searchQuery);
  }

  private _setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        this.resetPaginationAndRefetch();
      });
  }

  // Filter Methods
  toggleMobileFilters(): void {
    this.isMobileFiltersOpen = !this.isMobileFiltersOpen;
  }

  toggleEventTypeDropdown(): void {
    this.isEventTypeDropdownOpen = !this.isEventTypeDropdownOpen;
  }

  closeEventTypeDropdown(): void {
    this.isEventTypeDropdownOpen = false;
  }

  selectEventType(eventType: string): void {
    this.selectedEventType = eventType;
    this.closeEventTypeDropdown();
    this.resetPaginationAndRefetch();
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedEventType || this.searchQuery.trim());
  }

  clearEventTypeFilter(): void {
    this.selectedEventType = '';
    this.resetPaginationAndRefetch();
  }

  clearAllFilters(): void {
    this.searchQuery = '';
    this.selectedEventType = '';
    this.isMobileSearchExpanded = false;
    this.isDesktopSearchExpanded = false;
    this.resetPaginationAndRefetch();
  }

  // Event Methods
  onCardClick(eventId: string): void {
    this.showEventDetails(eventId);
  }

  showEventDetails(eventId: string): void {
    this.selectedEventId = eventId;
    this.isModalOpen = true;
  }

  closeModal = (): void => {
    this.isModalOpen = false;
    this.selectedEventId = null;
  }

  trackByEventId(index: number, event: IEvent): string {
    return event._id;
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/fallback-event.jpg'; // Add your fallback image
  }

  getLowestTicketPrice(event: IEvent): number {
    if (!event.tickets || event.tickets.length === 0) return 0;
    return Math.min(...event.tickets.map(ticket => ticket.price));
  }

  // Private Methods
  private _applyFilters(): void {
    let filtered = [...this.eventList];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(event =>
        event.eventTitle.toLowerCase().includes(query) ||
        event.eventDescription.toLowerCase().includes(query) ||
        event.city.toLowerCase().includes(query) ||
        event.venueName.toLowerCase().includes(query) ||
        event.eventType.toLowerCase().includes(query)
      );
    }

    if (this.selectedEventType) {
      filtered = filtered.filter(event => event.eventType === this.selectedEventType);
    }

    this.filteredEvents = filtered;
  }

  private resetPaginationAndRefetch(): void {
    this.currentPage = 1;
    this.eventList = [];
    this.filteredEvents = [];
    this.hasMoreEvents = true;
    this.allEventsLoaded = false;
    this._fetchAllEvents();
  }

  private _fetchAllEvents(): void {
    this.isLoading = true;
    this.currentPage = 1;
    this.eventList = [];
    this.filteredEvents = [];

    this._exploreService.getAllEvents(this.currentPage, this.pageSize)
      .pipe(
        tap((response) => {
          if (response.data) {
            this.eventList = response.data.events;
            this.filteredEvents = [...this.eventList];
            this.totalEvents = response.data.totalEvents;
            this.hasMoreEvents = this.eventList.length < this.totalEvents;
            this.allEventsLoaded = !this.hasMoreEvents;
            this._applyFilters();
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

  loadMoreEvents(): void {
    if (this.isLoadingMore || !this.hasMoreEvents || this.allEventsLoaded) {
      return;
    }

    this.isLoadingMore = true;
    this.currentPage++;

    this._exploreService.getAllEvents(this.currentPage, this.pageSize)
      .pipe(
        tap((response) => {
          if (response.data && response.data.events) {
            const newEvents = response.data.events;
            this.eventList = [...this.eventList, ...newEvents];
            this.hasMoreEvents = this.eventList.length < this.totalEvents;
            this.allEventsLoaded = !this.hasMoreEvents;
            this._applyFilters();
          }
        }),
        catchError((error) => {
          console.error('Error loading more events:', error);
          Notiflix.Notify.failure('Error loading more events');
          this.currentPage--;
          return of(null);
        }),
        takeUntil(this._destroy$),
        tap(() => this.isLoadingMore = false)
      )
      .subscribe();
  }
}
