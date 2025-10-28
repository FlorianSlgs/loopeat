import { TestBed } from '@angular/core/testing';

import { ProBorrowService } from './pro-borrow.service';

describe('ProBorrowService', () => {
  let service: ProBorrowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProBorrowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
