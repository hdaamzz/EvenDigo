import { TestBed } from '@angular/core/testing';

import { ChatHelperService } from './chat-helper.service';

describe('ChatHelperService', () => {
  let service: ChatHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
