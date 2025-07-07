import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import Notiflix from 'notiflix';
import { MenuItem } from 'primeng/api';
import { TruncatePipe } from "../../../../core/pipes/truncate.pipe";
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { AdminCardComponent } from "../../../../shared/admin-card/admin-card.component";
import { AdminEventsService } from '../../../../core/services/admin/events/admin.events.service';
import { IEvent } from '../../../../core/models/event.interface';
import { FormsModule } from '@angular/forms';

interface FilterOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-events-list',
  imports: [CommonModule, TruncatePipe, MenuModule, ButtonModule, DialogModule, DropdownModule, AdminCardComponent, FormsModule],
  templateUrl: './events-list.component.html',
  styleUrl: './events-list.component.css'
})
export class EventsListComponent implements OnInit, AfterViewInit, OnDestroy {
  events: IEvent[] = [];
  filteredEvents: IEvent[] = [];
  isLoading = false;
  displayModal = false;
  selectedEvent: IEvent | null = null;

  currentPage = 1;
  readonly pageLimit = 9;
  hasMoreEvents = true;
  totalEvents = 0;

  searchValue = '';
  selectedFilter: FilterOption | null = null;
  private readonly _searchSubject = new Subject<string>();

  filterOptions: FilterOption[] = [
    { label: 'All Events', value: 'all' },
    { label: 'Current Events', value: 'current' },
    { label: 'Completed Events', value: 'completed' }
  ];

  @ViewChild('endOfList') private _endOfList?: ElementRef;
  private _intersectionObserver?: IntersectionObserver;
  private readonly _destroy$ = new Subject<void>();

  constructor(private _eventsService: AdminEventsService, private _el: ElementRef) {
    this.selectedFilter = this.filterOptions[0];
  }


  ngOnInit(): void {
    this._setupSearchDebounce();
    this._fetchEvents();
  }


  ngAfterViewInit(): void {
    this._setupInfiniteScroll();
  }


  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();

    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect();
    }
  }

  private _setupSearchDebounce(): void {
    this._searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this._destroy$)
      )
      .subscribe(searchTerm => {
        this.searchValue = searchTerm;
        this._fetchEvents(true);
      });
  }



  private _setupInfiniteScroll(): void {
    if (!this._endOfList) return;

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };

    this._intersectionObserver = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !this.isLoading && this.hasMoreEvents) {
        this._loadMoreEvents();
      }
    }, options);

    this._intersectionObserver.observe(this._endOfList.nativeElement);
  }


  private _fetchEvents(reset: boolean = true): void {
    if (reset) {
      this.currentPage = 1;
      this.events = [];
      this.filteredEvents = [];
      this.hasMoreEvents = true;
    }

    this.isLoading = true;

    const filterValue = this.selectedFilter?.value || 'all';

    this._eventsService.getEvents(this.currentPage, this.pageLimit, this.searchValue, filterValue)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            if (response.data.length < this.pageLimit) {
              this.hasMoreEvents = false;
            }

            this.events = reset ? response.data : [...this.events, ...response.data];
            this.filteredEvents = [...this.events];

            if (response.total !== undefined) {
            this.totalEvents = response.total;
          }
          }
        },
        error: (error) => {
          console.error('Error while fetching events', error);
          Notiflix.Notify.failure('Error while fetching events');
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }
  private _loadMoreEvents(): void {
    if (this.isLoading || !this.hasMoreEvents) return;

    this.currentPage++;
    this._fetchEvents(false);
  }

  private _applyFilters(): void {
    let filtered = [...this.events];

    if (this.searchValue.trim()) {
      const searchTerm = this.searchValue.toLowerCase().trim();
      filtered = filtered.filter(event =>
        event.eventTitle.toLowerCase().includes(searchTerm) ||
        event.eventType.toLowerCase().includes(searchTerm) ||
        event.city.toLowerCase().includes(searchTerm) ||
        event.user_id.name.toLowerCase().includes(searchTerm) ||
        event.eventDescription.toLowerCase().includes(searchTerm)
      );
    }

    if (this.selectedFilter && this.selectedFilter.value !== 'all') {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      filtered = filtered.filter(event => {
        const eventDate = new Date(event.startDate);
        eventDate.setHours(0, 0, 0, 0);

        if (this.selectedFilter!.value === 'current') {
          return eventDate >= currentDate;
        } else if (this.selectedFilter!.value === 'completed') {
          return eventDate < currentDate;
        }
        return true;
      });
    }

    this.filteredEvents = filtered;
  }


  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this._searchSubject.next(target.value);
  }

  onSearchClear(): void {
    this.searchValue = '';
    this._searchSubject.next('');
  }
  onFilterChange(filter: FilterOption): void {
    this.selectedFilter = filter;
    this._fetchEvents(true);
  }


  refreshEvents(): void {
    this._fetchEvents(true);
  }


  viewAnalysis(event: IEvent): void {
  }

  viewDetails(event: IEvent): void {
    this.selectedEvent = event;
    this.displayModal = true;
  }

  getMenuItems(event: IEvent): MenuItem[] {
    return [
      {
        label: 'Details',
        icon: 'pi pi-info-circle',
        command: () => this.viewDetails(event)
      },
      {
        label: 'Analysis',
        icon: 'pi pi-chart-bar',
        command: () => this.viewAnalysis(event)
      },
      {
        label: event.status ? 'Unlist Event' : 'List Event',
        icon: event.status ? 'pi pi-eye-slash' : 'pi pi-eye',
        command: () => this._toggleEventStatus(event)
      }
    ];
  }


  private _toggleEventStatus(event: IEvent): void {
    this.isLoading = true;
    const newStatus = !event.status;

    this._eventsService.updateEventStatus(event._id, newStatus)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            const index = this.events.findIndex(e => e._id === event._id);
            if (index !== -1) {
              this.events[index].status = newStatus;
              this._applyFilters();
            }

            Notiflix.Notify.success(`Event ${newStatus ? 'listed' : 'unlisted'} successfully`);
          }
        },
        error: (error) => {
          console.error('Error while updating event status', error);
          Notiflix.Notify.failure('Failed to update event status');
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  getEventStatusBadge(event: IEvent): { text: string, classes: string } {
    return event.status
      ? { text: 'Listed', classes: 'bg-green-100 text-green-600' }
      : { text: 'Unlisted', classes: 'bg-gray-100 text-gray-600' };
  }


  getEventDateBadge(event: IEvent): { text: string, classes: string } {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const eventDate = new Date(event.startDate);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate >= currentDate) {
      return { text: 'Upcoming', classes: 'bg-blue-100 text-blue-600' };
    } else {
      return { text: 'Completed', classes: 'bg-gray-100 text-gray-600' };
    }
  }
}