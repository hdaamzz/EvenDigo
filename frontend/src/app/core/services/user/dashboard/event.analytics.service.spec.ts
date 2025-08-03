import { TestBed } from '@angular/core/testing';

import { EventAnalyticsService } from './event.analytics.service';

describe('EventAnalyticsService', () => {
  let service: EventAnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventAnalyticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
