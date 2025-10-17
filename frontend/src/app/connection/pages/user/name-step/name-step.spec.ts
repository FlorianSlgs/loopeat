import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NameStep } from './name-step';

describe('NameStep', () => {
  let component: NameStep;
  let fixture: ComponentFixture<NameStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NameStep]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NameStep);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
