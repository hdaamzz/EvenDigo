import { TestBed } from '@angular/core/testing';

import { AdminAchievementService } from './admin-achievement.service';

describe('AdminAchievementService', () => {
  let service: AdminAchievementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminAchievementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
