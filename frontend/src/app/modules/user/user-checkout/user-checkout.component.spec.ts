import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCheckoutComponent } from './user-checkout.component';

describe('UserCheckoutComponent', () => {
  let component: UserCheckoutComponent;
  let fixture: ComponentFixture<UserCheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCheckoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserCheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
