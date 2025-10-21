import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardMap } from './dashboard-map';

describe('DashboardMap', () => {
  let component: DashboardMap;
  let fixture: ComponentFixture<DashboardMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardMap);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
