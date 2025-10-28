import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProSettings } from './pro-settings';

describe('ProSettings', () => {
  let component: ProSettings;
  let fixture: ComponentFixture<ProSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
