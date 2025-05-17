import { Component, Input, ViewChild, ElementRef, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { format } from 'date-fns';
import { CardIEvent, IEvent } from '../../../../core/models/event.interface';

@Component({
  selector: 'app-event-card',
  imports: [CommonModule],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.css'
})
export class EventCardComponent implements OnInit {
  @Input() events: CardIEvent[] = [];
  expandedEventId = signal<string | null>(null);
  @ViewChild('eventElement', { read: ElementRef }) lastEventElementRef?: ElementRef;
  constructor() {}
  ngOnInit(): void {
  }

  toggleEventDetails(eventId: string): void {
    if (this.expandedEventId() === eventId) {
      this.expandedEventId.set(null);
    } else {
      this.expandedEventId.set(eventId);
    }
  }

  getBackgroundImage(event: IEvent): string {
    return event.mainBanner
      ? `url(${event.mainBanner})` 
      : "url('/placeholder-event.jpg')";
  }
}
