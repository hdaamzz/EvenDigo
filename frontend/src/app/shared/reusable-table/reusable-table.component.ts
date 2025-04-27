import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  header: string;
  type?: 'text' | 'badge' | 'amount';
  badgeMapping?: {[key: string]: {color: string, bgColor: string}};
}

export interface PageEvent {
  pageIndex: number;
  pageSize: number;
  page?: number; // Optional for backward compatibility
}

@Component({
  selector: 'app-reusable-table',
  imports: [CommonModule, FormsModule],
  templateUrl: './reusable-table.component.html',
  styleUrl: './reusable-table.component.css'
})
export class ReusableTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() pageSize: number = 5;
  @Input() showSearch: boolean = true;
  @Input() searchPlaceholder: string = "Search...";
  @Input() showPagination: boolean = true;
  @Input() showFilters: boolean = false;
  @Input() currentPage: number = 1;
  @Input() totalItems: number = 0;
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() rowClick = new EventEmitter<any>();
  
  searchTerm: string = '';
  
  get filteredData(): any[] {
    if (this.totalItems > 0) {
      return this.data;
    }
    
    let filtered = this.data;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        Object.values(item).some(val => 
          val && val.toString().toLowerCase().includes(term)
        )
      );
    }
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(startIndex, startIndex + this.pageSize);
  }
  
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }
  
  getPageArray(): number[] {
    return Array.from({ length: Math.min(5, this.totalPages) }, (_, i) => {
      if (this.totalPages <= 5) return i + 1;
      
      if (this.currentPage <= 3) return i + 1;
      if (this.currentPage >= this.totalPages - 2) return this.totalPages - 4 + i;
      return this.currentPage - 2 + i;
    });
  }
  
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.pageChange.emit({
      pageIndex: this.currentPage - 1, // Send 0-based index
      pageSize: this.pageSize,
      page: this.currentPage // For backward compatibility
    });
  }
  
  onSearch(): void {
    this.currentPage = 1; 
    this.searchChange.emit(this.searchTerm);
  }
  
  onRowClick(item: any): void {
    this.rowClick.emit(item);
  }
}