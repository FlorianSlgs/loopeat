import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { globalGuard } from './global-guard';

describe('globalGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => globalGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
