import { TestBed } from '@angular/core/testing';

import { PasswordAuthService } from './password-auth.service';

describe('PasswordAuthService', () => {
  let service: PasswordAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasswordAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
