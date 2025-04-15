import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IEvent } from '../../../../core/models/event.interface';
import { AdminEventsService } from '../../../../core/services/admin/admin.events.service';
import { catchError, finalize, of, Subject, takeUntil, tap } from 'rxjs';
import Notiflix from 'notiflix';
import { MenuItem } from 'primeng/api';
import { TruncatePipe } from "../../../../core/pipes/truncate.pipe";
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-events-list',
  imports: [CommonModule, TruncatePipe, MenuModule, ButtonModule,DialogModule],
  templateUrl: './events-list.component.html',
  styleUrl: './events-list.component.css'
})
export class EventsListComponent implements OnInit, AfterViewInit, OnDestroy{
  eventList:IEvent[]=[];
  loading:boolean=false;
  displayModal: boolean = false;
  selectedEvent: any = null;

  currentPage: number = 1;
  limit: number = 9;
  hasMoreEvents: boolean = true;

  @ViewChild('endOfList') endOfList: ElementRef | undefined;
  private intersectionObserver: IntersectionObserver | undefined;
  private destroy$ = new Subject<void>();

  constructor(private eventService:AdminEventsService , private el: ElementRef  ){}
  ngOnInit(): void {
    this.fetchEvents();
  }

  ngAfterViewInit(): void {
    this.setupInfiniteScroll();
  }
  // Subject with the takeUntil operator to automatically unsubscribe from observables when the component is destroyed. This prevents memory leaks
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  setupInfiniteScroll(): void {
    if (!this.endOfList) return;
    
    const options = {
      root: null, 
      rootMargin: '0px',
      threshold: 0.5 
    };
    // IntersectionObserver: A browser API that asynchronously observes changes
    this.intersectionObserver = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !this.loading && this.hasMoreEvents) {
        this.loadMoreEvents();
      }
    }, options);
    
    this.intersectionObserver.observe(this.endOfList.nativeElement);
  }



  fetchEvents(reset: boolean = true): void {
    if (reset) {
      this.currentPage = 1;
      this.eventList = [];
      this.hasMoreEvents = true;
    }
    
    this.loading = true;
    this.eventService.eventList(this.currentPage, this.limit).pipe(
      tap((response) => {
        if (response.success) {
          if (response.data.length < this.limit) {
            this.hasMoreEvents = false;
          }
          
          if (reset) {
            this.eventList = response.data;
          } else {
            this.eventList = [...this.eventList, ...response.data];
          }
        }
      }),
      catchError((error) => {
        console.error('Error while fetching events', error);
        Notiflix.Notify.failure('Error while fetching events');
        return of(null);
      }),
      finalize(() => this.loading = false),
      takeUntil(this.destroy$)
    ).subscribe();
  }
  loadMoreEvents(): void {
    if (this.loading || !this.hasMoreEvents) return;
    
    this.currentPage++;
    this.fetchEvents(false);
  }

  viewAnalysis(event: any): void {
    console.log('View analysis', event);
  }
  viewDetails(event: IEvent): void {
    this.selectedEvent = event;
    this.displayModal = true;
  }

  getMenuItems(event: any): MenuItem[] {
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
        command: () => this.toggleEventStatus(event)
      }
    ];
  }

  toggleEventStatus(event: IEvent): void {
    this.loading = true;
    const newStatus = !event.status;
    
    this.eventService.updateEventStatus(event._id, newStatus).pipe(
      tap((response) => {
        if (response.success) {
          const index = this.eventList.findIndex(e => e._id === event._id);
          if (index !== -1) {
            this.eventList[index].status = newStatus;
          }
          
          Notiflix.Notify.success(`Event ${newStatus ? 'listed' : 'unlisted'} successfully`);
        }
      }),
      catchError((error) => {
        console.error('Error while updating event status', error);
        Notiflix.Notify.failure('Failed to update event status');
        return of(null);
      }),
      finalize(() => this.loading = false),
      takeUntil(this.destroy$)
    ).subscribe();
  }



}
