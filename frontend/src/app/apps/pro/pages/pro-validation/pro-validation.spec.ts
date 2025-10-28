import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProValidation } from './pro-validation';

describe('ProValidation', () => {
  let component: ProValidation;
  let fixture: ComponentFixture<ProValidation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProValidation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProValidation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
