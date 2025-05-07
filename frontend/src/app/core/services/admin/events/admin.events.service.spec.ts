import { TestBed } from '@angular/core/testing';

import { AdminEventsService } from './admin.events.service';

describe('AdminEventsService', () => {
  let service: AdminEventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminEventsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
