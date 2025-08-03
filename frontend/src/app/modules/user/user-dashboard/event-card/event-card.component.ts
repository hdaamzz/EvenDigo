import { Component, Input, ViewChild, ElementRef, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardIEvent, IEvent } from '../../../../core/models/event.interface';
import { LivestreamService } from '../../../../core/services/user/stream/livestream.service';

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
  liveStreamStates = signal<Map<string, { isStarting: boolean; isLive: boolean }>>(new Map());

  @ViewChild('eventElement', { read: ElementRef }) lastEventElementRef?: ElementRef;

  constructor(
    private livestreamService: LivestreamService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeLiveStreamStates();
    this.checkLiveStreamStatuses();
  }

  private initializeLiveStreamStates(): void {
    const statesMap = new Map();
    this.events.forEach(event => {
      statesMap.set(event._id, { isStarting: false, isLive: false });
    });
    this.liveStreamStates.set(statesMap);
  }

  private checkLiveStreamStatuses(): void {
    this.events.forEach(event => {
      this.livestreamService.getLiveStreamStatus(event._id).subscribe({
        next: (response) => {
          if (response.success) {
            this.updateLiveStreamState(event._id, {
              isStarting: false,
              isLive: response.data.isLive
            });
          }
        },
        error: (error) => {
          console.error('Failed to get live stream status:', error);
        }
      });
    });
  }

  private updateLiveStreamState(eventId: string, state: { isStarting: boolean; isLive: boolean }): void {
    const currentStates = this.liveStreamStates();
    currentStates.set(eventId, state);
    this.liveStreamStates.set(new Map(currentStates));
  }

  getLiveStreamState(eventId: string): { isStarting: boolean; isLive: boolean } {
    return this.liveStreamStates().get(eventId) || { isStarting: false, isLive: false };
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
    const currentState = this.getLiveStreamState(event._id);
    if (currentState.isLive) {
      this.router.navigate(['/live-stream'], {
        queryParams: {
          role: 'host',
          eventId: event._id
        }
      });
      return;
    }

    if (currentState.isStarting) {
      return;
    }

    this.updateLiveStreamState(event._id, { isStarting: true, isLive: false });

    this.livestreamService.startLiveStream(event._id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.updateLiveStreamState(event._id, { isStarting: false, isLive: true });

          this.router.navigate(['/live-stream'], {
            queryParams: {
              role: 'host',
              eventId: event._id
            },
            state: {
              token: response.data.token,
              roomId: response.data.roomId,
              eventId: event._id
            }
          });
        } else {
          this.updateLiveStreamState(event._id, { isStarting: false, isLive: false });
          console.error('Failed to start live stream:', response.message);
          alert('Failed to start live stream: ' + (response.message || 'Unknown error'));
        }
      },
      error: (error) => {
        this.updateLiveStreamState(event._id, { isStarting: false, isLive: false });
        console.error('Failed to start live stream:', error);
        alert('Failed to start live stream. Please try again.');
      }
    });
  }

  watchLive(event: CardIEvent): void {
    this.router.navigate(['/live-stream'], {
      queryParams: { role: 'audience', eventId: event._id }
    });
  }

  viewAnalytics(event: CardIEvent): void {
    this.router.navigate(['/event-analytics', event._id]);
  }

  isOrganizedTab(): boolean {
    return this.activeTab === 'organized';
  }
}
