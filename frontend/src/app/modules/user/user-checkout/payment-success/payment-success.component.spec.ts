import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentSuccessComponent } from './payment-success.component';

describe('PaymentSuccessComponent', () => {
  let component: PaymentSuccessComponent;
  let fixture: ComponentFixture<PaymentSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentSuccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// http://localhost:4200/payment/success?session_id=cs_test_a1fPO1yuyeXVYApybqFCR8LQB505r2TqQz33cDTltRvOjFecNG5zznHS5s
