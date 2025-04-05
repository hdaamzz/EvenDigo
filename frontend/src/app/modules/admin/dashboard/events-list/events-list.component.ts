import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IEvent } from '../../../../core/models/event.interface';
import { AdminEventsService } from '../../../../core/services/admin/admin.events.service';
import { catchError, finalize, of, tap } from 'rxjs';
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
export class EventsListComponent implements OnInit{
  eventList:IEvent[]=[];
  loading:boolean=false;
  displayModal: boolean = false;
  selectedEvent: any = null;

  constructor(private eventService:AdminEventsService){}
  ngOnInit(): void {
    this.fetchEvents();
  }
  fetchEvents(){
    this.loading=true;
    this.eventService.eventList().pipe(
      tap((response)=>{
        if(response.success){
          console.log(response);
          
          this.eventList=response.data
        }
      }),
      catchError((error)=>{
        console.error('Error while fetching events',error);
        Notiflix.Notify.failure('Error while fetching events');
        return of(null)
      }),
      finalize(()=>this.loading=false)
    ).subscribe()
  }
  // menuItems: MenuItem[] = [
  //   {
  //     label: 'Details',
  //     icon: 'pi pi-info-circle',
  //     command: (event) => this.viewDetails(event)
  //   },
  //   {
  //     label: 'Analysis',
  //     icon: 'pi pi-chart-bar',
  //     command: (event) => this.viewAnalysis(event)
  //   }
  // ];

  viewAnalysis(event: any): void {
    // Handle view analysis action
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
      }
    ];
  }



}
