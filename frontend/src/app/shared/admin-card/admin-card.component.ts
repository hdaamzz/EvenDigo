import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-admin-card',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuModule, ButtonModule, InputTextModule],
  templateUrl: './admin-card.component.html',
  styleUrl: './admin-card.component.css'
})
export class AdminCardComponent {
  @Input() menuItems: MenuItem[] = [];
  @Input() statusBadge: { text: string, classes: string } | null = null;
  @Input() showMenu: boolean = true;
  @Input() showSearch: boolean = false;
  @Input() searchPlaceholder: string = 'Search...';
  @Input() searchValue: string = '';
  @Output() cardClick = new EventEmitter<void>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() searchClear = new EventEmitter<void>();

  toggleMenu(event: Event, menu: any): void {
    menu.toggle(event);
  }

  onCardClick(): void {
    this.cardClick.emit();
  }

  onSearchChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  this.searchChange.emit(target.value);
}

  onClearSearch(): void {
    this.searchValue = '';
    this.searchClear.emit();
  }
}