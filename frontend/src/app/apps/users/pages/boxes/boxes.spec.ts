import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Boxes } from './boxes';

describe('Boxes', () => {
  let component: Boxes;
  let fixture: ComponentFixture<Boxes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Boxes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Boxes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
