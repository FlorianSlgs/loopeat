import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProSelection } from './pro-selection';

describe('ProSelection', () => {
  let component: ProSelection;
  let fixture: ComponentFixture<ProSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProSelection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProSelection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
