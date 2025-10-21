import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersHome } from './users-home';

describe('UsersHome', () => {
  let component: UsersHome;
  let fixture: ComponentFixture<UsersHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
