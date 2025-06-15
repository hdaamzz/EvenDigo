import { TestBed } from '@angular/core/testing';

import { ZegoService } from './zego.service';

describe('ZegoService', () => {
  let service: ZegoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZegoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
