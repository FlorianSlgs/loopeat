import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RechargeSuccess } from './recharge-success';

describe('RechargeSuccess', () => {
  let component: RechargeSuccess;
  let fixture: ComponentFixture<RechargeSuccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RechargeSuccess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RechargeSuccess);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
