import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RechargeCancel } from './recharge-cancel';

describe('RechargeCancel', () => {
  let component: RechargeCancel;
  let fixture: ComponentFixture<RechargeCancel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RechargeCancel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RechargeCancel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
