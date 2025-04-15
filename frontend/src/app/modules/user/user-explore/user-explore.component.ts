import { Component, OnInit } from '@angular/core';
import { UserDashboardService } from '../../../core/services/user/dashboard/user.dashboard.service';
import { IEvent } from '../../../core/models/event.interface';
import { catchError, of, tap } from 'rxjs';
import Notiflix from 'notiflix';
import { UserExploreService } from '../../../core/services/user/explore/user.explore.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TruncatePipe } from '../../../core/pipes/truncate.pipe';
import { EventDetailModalComponent } from './event-detail-modal/event-detail-modal.component';
import { UserNavComponent } from "../../../shared/user-nav/user-nav.component";

@Component({
  selector: 'app-user-explore',
  imports: [CommonModule, RouterModule, TruncatePipe, EventDetailModalComponent, UserNavComponent],
  templateUrl: './user-explore.component.html',
  styleUrls: ['./user-explore.component.css']
})
export class UserExploreComponent implements OnInit{
  eventList: IEvent[] = [];
  eventListLoading: boolean = false;
  selectedEventId: string | null = null; 
  isModalOpen: boolean = false; 

  constructor(private exploreService: UserExploreService) {}

  ngOnInit(): void {
    this.fetchAllEvents();
  }

  fetchAllEvents() {
    this.eventListLoading = true;
    this.exploreService.getAllEvents().pipe(
      tap((response) => {
        if(response.data){
          this.eventList = response.data;
          this.eventListLoading = false;
        }
      }),
      catchError((error) => {
        console.error('Error fetching events:', error);
        Notiflix.Notify.failure('Error fetching events');
        this.eventListLoading = false;
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

  // Show event details in the modal
  showEventDetails(eventId: string) {
    console.log(eventId);
    
    this.selectedEventId = eventId;
    this.isModalOpen = true;
  }

  // Close the modal
  closeModal = () => {
    console.log('closeModal function called from parent');
    this.isModalOpen = false;
    console.log('isModalOpen set to:', this.isModalOpen);
    this.selectedEventId = null;
  }
  

}
