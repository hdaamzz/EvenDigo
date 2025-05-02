import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremiumCheckoutComponent } from './premium-checkout.component';

describe('PremiumCheckoutComponent', () => {
  let component: PremiumCheckoutComponent;
  let fixture: ComponentFixture<PremiumCheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremiumCheckoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremiumCheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
