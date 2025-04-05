import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileEventsComponent } from './profile.events.component';

describe('ProfileEventsComponent', () => {
  let component: ProfileEventsComponent;
  let fixture: ComponentFixture<ProfileEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileEventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
