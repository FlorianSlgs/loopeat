import { TestBed } from '@angular/core/testing';

import { BorrowWebsocketService } from './borrow-websocket.service';

describe('BorrowWebsocketService', () => {
  let service: BorrowWebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BorrowWebsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
