import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceBookingComponent } from './finance-booking.component';

describe('FinanceBookingComponent', () => {
  let component: FinanceBookingComponent;
  let fixture: ComponentFixture<FinanceBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinanceBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
