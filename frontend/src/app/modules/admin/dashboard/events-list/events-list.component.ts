import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import Notiflix from 'notiflix';
import { MenuItem } from 'primeng/api';
import { TruncatePipe } from "../../../../core/pipes/truncate.pipe";
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AdminCardComponent } from "../../../../shared/admin-card/admin-card.component";
import { AdminEventsService } from '../../../../core/services/admin/events/admin.events.service';
import { IEvent } from '../../../../core/models/event.interface';

@Component({
  selector: 'app-events-list',
  imports: [CommonModule, TruncatePipe, MenuModule, ButtonModule, DialogModule, AdminCardComponent],
  templateUrl: './events-list.component.html',
  styleUrl: './events-list.component.css'
})
export class EventsListComponent implements OnInit, AfterViewInit, OnDestroy {
  events: IEvent[] = [];
  isLoading = false;
  displayModal = false;
  selectedEvent: IEvent | null = null;

  currentPage = 1;
  readonly pageLimit = 9;
  hasMoreEvents = true;

  @ViewChild('endOfList') private _endOfList?: ElementRef;
  private _intersectionObserver?: IntersectionObserver;
  private readonly _destroy$ = new Subject<void>();

  constructor(private _eventsService: AdminEventsService, private _el: ElementRef) {}

  /**
   * Initialize component and fetch first page of events
   */
  ngOnInit(): void {
    this._fetchEvents();
  }

  /**
   * Set up the infinite scroll functionality after view is initialized
   */
  ngAfterViewInit(): void {
    this._setupInfiniteScroll();
  }

  /**
   * Clean up subscriptions and observers when component is destroyed
   */
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    
    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect();
    }
  }

  /**
   * Setup infinite scroll using IntersectionObserver
   */
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

  /**
   * Fetch events from the service with optional reset parameter
   * @param reset Whether to reset the event list or append to it
   */
  private _fetchEvents(reset: boolean = true): void {
    if (reset) {
      this.currentPage = 1;
      this.events = [];
      this.hasMoreEvents = true;
    }
    
    this.isLoading = true;
    this._eventsService.getEvents(this.currentPage, this.pageLimit)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            if (response.data.length < this.pageLimit) {
              this.hasMoreEvents = false;
            }
            
            this.events = reset ? response.data : [...this.events, ...response.data];
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

  /**
   * Load more events when scrolling down
   */
  private _loadMoreEvents(): void {
    if (this.isLoading || !this.hasMoreEvents) return;
    
    this.currentPage++;
    this._fetchEvents(false);
  }

  /**
   * Handler for viewing event analysis
   * @param event The event to analyze
   */
  viewAnalysis(event: IEvent): void {
    console.log('View analysis', event);
    // TODO: Implement analysis view
  }

  /**
   * Display details modal for selected event
   * @param event The event to display details for
   */
  viewDetails(event: IEvent): void {
    this.selectedEvent = event;
    this.displayModal = true;
  }

  /**
   * Generate menu items for event actions
   * @param event The event to generate menu for
   * @returns Array of menu items
   */
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

  /**
   * Toggle the listing status of an event
   * @param event The event to update
   */
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

  /**
   * Get the appropriate badge styling for event status
   * @param event The event to get badge for
   * @returns Object with text and CSS classes for badge
   */
  getEventStatusBadge(event: IEvent): { text: string, classes: string } {
    return event.status 
      ? { text: 'Listed', classes: 'bg-green-100 text-green-600' }
      : { text: 'Unlisted', classes: 'bg-gray-100 text-gray-600' };
  }
}