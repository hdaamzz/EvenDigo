import { TestBed } from '@angular/core/testing';

import { UserExploreService } from './user.explore.service';

describe('UserExploreService', () => {
  let service: UserExploreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserExploreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
