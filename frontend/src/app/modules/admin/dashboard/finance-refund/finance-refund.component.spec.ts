import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceRefundComponent } from './finance-refund.component';

describe('FinanceRefundComponent', () => {
  let component: FinanceRefundComponent;
  let fixture: ComponentFixture<FinanceRefundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceRefundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinanceRefundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
