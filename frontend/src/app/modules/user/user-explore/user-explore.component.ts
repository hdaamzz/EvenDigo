import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, catchError, of, takeUntil, tap, debounceTime, distinctUntilChanged } from 'rxjs';
import Notiflix from 'notiflix';

import { UserExploreService } from '../../../core/services/user/explore/user.explore.service';
import { IEvent } from '../../../core/models/event.interface';
import { TruncatePipe } from '../../../core/pipes/truncate.pipe';
import { EventDetailModalComponent } from './event-detail-modal/event-detail-modal.component';
import { UserNavComponent } from "../../../shared/user-nav/user-nav.component";

@Component({
  selector: 'app-user-explore',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TruncatePipe, EventDetailModalComponent, UserNavComponent],
  templateUrl: './user-explore.component.html',
  styleUrls: ['./user-explore.component.css']
})
export class UserExploreComponent implements OnInit, OnDestroy {

  eventList: IEvent[] = [];
  filteredEvents: IEvent[] = [];
  isLoading = false;
  selectedEventId: string | null = null;
  isModalOpen = false;
  isMobileFiltersOpen = false;


  // Search and Filter Properties
  searchQuery = '';
  selectedEventType = '';
  selectedSort = 'Newest';
  selectedVisibility = 'All';

  // Dropdown States
  isEventTypeDropdownOpen = false;
  isSortDropdownOpen = false;
  isVisibilityDropdownOpen = false;

  // Search Subject for Debouncing
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

  sortOptions = [
    { label: 'Newest', value: 'newest' },
    { label: 'Oldest', value: 'oldest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Date: Upcoming', value: 'date_asc' },
    { label: 'Alphabetical', value: 'alphabetical' }
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Close dropdowns when clicking outside
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.closeAllDropdowns();
    }
  }

  // Search and Filter Methods
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
        this._applyFilters();
      });
  }

  private _applyFilters(): void {
    let filtered = [...this.eventList];

    // Apply search filter
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

    
    // Apply event type filter
    if (this.selectedEventType) {
      filtered = filtered.filter(event => event.eventType === this.selectedEventType);
    }

    // Apply visibility filter
    if (this.selectedVisibility !== 'All') {
      filtered = filtered.filter(event => event.eventVisibility === this.selectedVisibility);
    }

    // Apply sorting
    filtered = this._sortEvents(filtered);

    this.filteredEvents = filtered;
  }

  toggleMobileFilters(): void {
    this.isMobileFiltersOpen = !this.isMobileFiltersOpen;
  }
  closeMobileFilters(): void {
    this.isMobileFiltersOpen = false;
  }
  onMobileFiltersClickOutside(): void {
    this.isMobileFiltersOpen = false;
  }
  selectEventTypeAndCloseMobile(eventType: string): void {
    this.selectEventType(eventType);
    this.closeMobileFilters();
  }
  selectSortAndCloseMobile(value: string, label: string): void {
    this.selectSort(value, label);
    this.closeMobileFilters();
  }

  selectVisibilityAndCloseMobile(value: string, label: string): void {
    this.selectVisibility(value, label);
    this.closeMobileFilters();
  }
  private _sortEvents(events: IEvent[]): IEvent[] {
    switch (this.selectedSort) {
      case 'newest':
        return events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      case 'oldest':
        return events.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      case 'price_asc':
        return events.sort((a, b) => this.getLowestTicketPrice(a) - this.getLowestTicketPrice(b));
      
      case 'price_desc':
        return events.sort((a, b) => this.getLowestTicketPrice(b) - this.getLowestTicketPrice(a));
      
      case 'date_asc':
        return events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      
      case 'alphabetical':
        return events.sort((a, b) => a.eventTitle.localeCompare(b.eventTitle));
      
      default:
        return events;
    }
  }

  // Dropdown Methods
  toggleEventTypeDropdown(): void {
    this.closeAllDropdowns();
    this.isEventTypeDropdownOpen = !this.isEventTypeDropdownOpen;
  }

  toggleSortDropdown(): void {
    this.closeAllDropdowns();
    this.isSortDropdownOpen = !this.isSortDropdownOpen;
  }

  toggleVisibilityDropdown(): void {
    this.closeAllDropdowns();
    this.isVisibilityDropdownOpen = !this.isVisibilityDropdownOpen;
  }

  closeEventTypeDropdown(): void {
    this.isEventTypeDropdownOpen = false;
  }

  closeSortDropdown(): void {
    this.isSortDropdownOpen = false;
  }

  closeVisibilityDropdown(): void {
    this.isVisibilityDropdownOpen = false;
  }

  closeAllDropdowns(): void {
    this.isEventTypeDropdownOpen = false;
    this.isSortDropdownOpen = false;
    this.isVisibilityDropdownOpen = false;
  }

  // Selection Methods
  selectEventType(eventType: string): void {
    this.selectedEventType = eventType;
    this.closeEventTypeDropdown();
    this._applyFilters();
  }

  selectSort(sortValue: string, sortLabel: string): void {
    this.selectedSort = sortLabel;
    this.closeSortDropdown();
    this._applyFilters();
  }

  selectVisibility(visibilityValue: string, visibilityLabel: string): void {
    this.selectedVisibility = visibilityLabel;
    this.closeVisibilityDropdown();
    this._applyFilters();
  }

  // Filter Management
  hasActiveFilters(): boolean {
    return !!(this.selectedEventType || this.selectedVisibility !== 'All' || this.searchQuery.trim());
  }

  clearEventTypeFilter(): void {
    this.selectedEventType = '';
    this._applyFilters();
  }

  clearVisibilityFilter(): void {
    this.selectedVisibility = 'All';
    this._applyFilters();
  }

  clearAllFilters(): void {
    this.searchQuery = '';
    this.selectedEventType = '';
    this.selectedVisibility = 'All';
    this.selectedSort = 'Newest';
    this._applyFilters();
  }

  // Event Methods
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

  onChatWithOrganizer(eventId: string): void {
    // Implement chat functionality
    console.log('Chat with organizer for event:', eventId);
  }

  onImageError(event: any): void {
    // Set fallback image
    event.target.src = 'assets/images/event-placeholder.jpg';
  }

  trackByEventId(index: number, event: IEvent): string {
    return event._id;
  }

  private _fetchAllEvents(): void {
    this.isLoading = true;

    this._exploreService.getAllEvents()
      .pipe(
        tap((response) => {
          if (response.data) {
            this.eventList = response.data;
            this.filteredEvents = [...this.eventList];
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
}