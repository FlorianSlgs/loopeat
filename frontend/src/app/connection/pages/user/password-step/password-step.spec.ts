import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordStep } from './password-step';

describe('PasswordStep', () => {
  let component: PasswordStep;
  let fixture: ComponentFixture<PasswordStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordStep]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordStep);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
