import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProHome } from './pro-home';

describe('ProHome', () => {
  let component: ProHome;
  let fixture: ComponentFixture<ProHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
