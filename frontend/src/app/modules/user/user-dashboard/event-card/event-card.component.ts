import { Component, Input, ViewChild, ElementRef, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardIEvent, IEvent } from '../../../../core/models/event.interface';

@Component({
  selector: 'app-event-card',
  imports: [CommonModule],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.css'
})
export class EventCardComponent implements OnInit {
  @Input() events: CardIEvent[] = [];
  @Input() activeTab: string = ''; 
  
  expandedEventId = signal<string | null>(null);
  
  @ViewChild('eventElement', { read: ElementRef }) lastEventElementRef?: ElementRef;
  
  constructor() {}
  
  ngOnInit(): void {
  }

  getUniqueEventId(eventIndex: number): string {
    return `${this.activeTab}-${eventIndex}`;
  }

  toggleEventDetails(eventIndex: number): void {
    const uniqueId = this.getUniqueEventId(eventIndex);
    
    if (this.expandedEventId() === uniqueId) {
      this.expandedEventId.set(null);
    } else {
      this.expandedEventId.set(uniqueId);
    }
  }

  isEventExpanded(eventIndex: number): boolean {
    const uniqueId = this.getUniqueEventId(eventIndex);
    return this.expandedEventId() === uniqueId;
  }

  getBackgroundImage(event: IEvent): string {
    return event.mainBanner
      ? `url(${event.mainBanner})` 
      : "url('/placeholder-event.jpg')";
  }

  goLive(event: CardIEvent): void {
    console.log('Starting livestream for event:', event);
  }
}