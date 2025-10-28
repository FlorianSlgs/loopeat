import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProDashboard } from './pro-dashboard';

describe('ProDashboard', () => {
  let component: ProDashboard;
  let fixture: ComponentFixture<ProDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
