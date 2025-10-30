import { TestBed } from '@angular/core/testing';

import { ProGiveBackService } from './pro-give-back.service';

describe('ProGiveBackService', () => {
  let service: ProGiveBackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProGiveBackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
