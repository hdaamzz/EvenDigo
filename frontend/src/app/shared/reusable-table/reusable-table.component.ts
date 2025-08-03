import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
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
  page?: number; 
}

@Component({
  selector: 'app-reusable-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reusable-table.component.html',
  styleUrl: './reusable-table.component.css'
})
export class ReusableTableComponent implements OnChanges {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() pageSize = 5;
  @Input() showSearch = true;
  @Input() searchPlaceholder = "Search...";
  @Input() showPagination = true;
  @Input() showFilters = false;
  @Input() currentPage = 1;
  @Input() totalItems = 0;
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() rowClick = new EventEmitter<any>();
  
  searchTerm = '';
  private readonly _maxPageButtons = 5;
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentPage'] && changes['currentPage'].currentValue) {
      const maxPage = this.totalPages;
      if (this.currentPage > maxPage && maxPage > 0) {
        this.currentPage = maxPage;
      }
    }
  }
  
  get filteredData(): any[] {
    if (this.totalItems > 0) {
      return this.data; 
    }
    
    let filtered = this._filterData();
    return this._paginateData(filtered);
  }

  get totalPages(): number {
    if (this.totalItems > 0) {
      return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
    }
    
    const filteredLength = this._filterData().length;
    return Math.max(1, Math.ceil(filteredLength / this.pageSize));
  }
  
  getPageArray(): number[] {
    const totalPages = this.totalPages;
    const maxButtons = Math.min(this._maxPageButtons, totalPages);
    
    if (totalPages <= this._maxPageButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }
  
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    
    this.currentPage = page;
    this._emitPageChange();
  }
  
  onSearch(): void {
    this.searchChange.emit(this.searchTerm);
    
    if (this.totalItems === 0) {
      this.currentPage = 1;
      this._emitPageChange();
    }
  }
  
  onRowClick(item: any): void {
    this.rowClick.emit(item);
  }
  
  private _filterData(): any[] {
    if (!this.searchTerm) {
      return this.data;
    }
    
    const term = this.searchTerm.toLowerCase();
    return this.data.filter(item => 
      this._columnKeys.some(key => {
        const value = item[key];
        return value !== null && 
               value !== undefined && 
               value.toString().toLowerCase().includes(term);
      })
    );
  }
  
  private get _columnKeys(): string[] {
    return this.columns.map(col => col.key);
  }
  
  private _paginateData(data: any[]): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return data.slice(startIndex, startIndex + this.pageSize);
  }
  
  private _emitPageChange(): void {
    this.pageChange.emit({
      pageIndex: this.currentPage - 1,  
      pageSize: this.pageSize,
      page: this.currentPage 
    });
  }
}