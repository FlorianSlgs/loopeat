import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProGiveBackValidation } from './pro-give-back-validation';

describe('ProGiveBackValidation', () => {
  let component: ProGiveBackValidation;
  let fixture: ComponentFixture<ProGiveBackValidation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProGiveBackValidation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProGiveBackValidation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
