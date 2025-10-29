import { TestBed } from '@angular/core/testing';

import { ProAccountsService } from './pro-accounts.service';

describe('ProAccountsService', () => {
  let service: ProAccountsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProAccountsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
