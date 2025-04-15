import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileBookingsComponent } from './profile.bookings.component';

describe('ProfileBookingsComponent', () => {
  let component: ProfileBookingsComponent;
  let fixture: ComponentFixture<ProfileBookingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileBookingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileBookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
