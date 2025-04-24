
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-admin-card',
  standalone: true,
  imports: [CommonModule, MenuModule, ButtonModule],
  templateUrl: './admin-card.component.html',
  styleUrl: './admin-card.component.css'
})
export class AdminCardComponent {
  @Input() menuItems: MenuItem[] = [];
  @Input() statusBadge: { text: string, classes: string } | null = null;
  @Input() showMenu: boolean = true;
  @Output() cardClick = new EventEmitter<void>();

  toggleMenu(event: Event, menu: any): void {
    menu.toggle(event);
  }

  onCardClick(): void {
    this.cardClick.emit();
  }
}
