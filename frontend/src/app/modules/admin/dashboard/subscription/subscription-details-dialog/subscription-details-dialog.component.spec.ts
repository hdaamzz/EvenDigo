import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionDetailsDialogComponent } from './subscription-details-dialog.component';

describe('SubscriptionDetailsDialogComponent', () => {
  let component: SubscriptionDetailsDialogComponent;
  let fixture: ComponentFixture<SubscriptionDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionDetailsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
