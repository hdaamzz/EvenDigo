import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceRevenueComponent } from './finance-revenue.component';

describe('FinanceRevenueComponent', () => {
  let component: FinanceRevenueComponent;
  let fixture: ComponentFixture<FinanceRevenueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceRevenueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinanceRevenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
