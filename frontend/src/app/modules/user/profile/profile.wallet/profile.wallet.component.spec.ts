import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileWalletComponent } from './profile.wallet.component';

describe('ProfileWalletComponent', () => {
  let component: ProfileWalletComponent;
  let fixture: ComponentFixture<ProfileWalletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileWalletComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
