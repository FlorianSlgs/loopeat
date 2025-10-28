import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProHistorical } from './pro-historical';

describe('ProHistorical', () => {
  let component: ProHistorical;
  let fixture: ComponentFixture<ProHistorical>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProHistorical]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProHistorical);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
