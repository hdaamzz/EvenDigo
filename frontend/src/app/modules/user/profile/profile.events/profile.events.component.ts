import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { IEvent } from "../../../../core/models/event.interface";
import { UserProfileService } from "../../../../core/services/user/profile/user.profile.service";
import Notiflix from "notiflix";
import { catchError, of, tap } from "rxjs";


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

 constructor(private profileService:UserProfileService){}
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
  
}
