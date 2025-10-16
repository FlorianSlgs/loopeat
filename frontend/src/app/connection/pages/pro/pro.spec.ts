import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pro } from './pro';

describe('Pro', () => {
  let component: Pro;
  let fixture: ComponentFixture<Pro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
