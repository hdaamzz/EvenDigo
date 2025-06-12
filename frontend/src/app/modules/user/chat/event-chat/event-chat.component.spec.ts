import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventChatComponent } from './event-chat.component';

describe('EventChatComponent', () => {
  let component: EventChatComponent;
  let fixture: ComponentFixture<EventChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
