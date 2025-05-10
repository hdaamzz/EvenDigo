import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { IEvent } from "../../../../core/models/event.interface";
import { UserProfileService } from "../../../../core/services/user/profile/user.profile.service";
import Notiflix from "notiflix";
import { catchError, of, tap } from "rxjs";
import { Router } from "@angular/router";


@Component({
  selector: 'app-profile.events',
  imports: [CommonModule],
  templateUrl: './profile.events.component.html',
  styleUrl: './profile.events.component.css'
})
export class ProfileEventsComponent implements OnInit{
 eventList: IEvent[] = [];
 eventListLoading: boolean = false;
 selectedEventId: string | null = null; 
 deleteConfirmDialogVisible: boolean = false;
 eventToDelete: string | null = null;

 constructor(private profileService:UserProfileService,
  private router: Router
 ){}
  ngOnInit(): void {
    this.fetchAllEvents()
  }

    fetchAllEvents() {
      this.eventListLoading = true;
      this.profileService.getUserEvents().pipe(
        tap((response) => {
          if(response.data){
            this.eventList = response.data;
            console.log(this.eventList);
            
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
    editEvent(eventId: string) {
      this.router.navigate(['/profile/edit-event', eventId]);
    }
  
    confirmDelete(eventId: string) {
      this.eventToDelete = eventId;
      this.deleteConfirmDialogVisible = true;
    }
  
    cancelDelete() {
      this.eventToDelete = null;
      this.deleteConfirmDialogVisible = false;
    }
  
    deleteEvent() {
      if (!this.eventToDelete) return;
      
      this.profileService.deleteEvent(this.eventToDelete).pipe(
        tap((response) => {
          Notiflix.Notify.success('Event deleted successfully');
          this.deleteConfirmDialogVisible = false;
          this.eventToDelete = null;
          this.fetchAllEvents();
        }),
        catchError((error) => {
          console.error('Error deleting event:', error);
          Notiflix.Notify.failure('Failed to delete event');
          return of(null);
        })
      ).subscribe();
    }
}
