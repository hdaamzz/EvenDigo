import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSubscriptionComponent } from './profile.subscription.component';

describe('ProfileSubscriptionComponent', () => {
  let component: ProfileSubscriptionComponent;
  let fixture: ComponentFixture<ProfileSubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileSubscriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
