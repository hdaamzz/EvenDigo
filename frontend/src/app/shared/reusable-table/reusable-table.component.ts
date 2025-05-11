import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  header: string;
  type?: 'text' | 'badge' | 'amount';
  badgeMapping?: {[key: string]: {color: string, bgColor: string}};
}

/**
 * Interface for pagination events
 */
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
    if (changes['data'] && !changes['data'].firstChange && 
        changes['data'].previousValue?.length !== changes['data'].currentValue?.length) {
      this._resetToFirstPage();
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
    return Array.from({ length: Math.min(this._maxPageButtons, this.totalPages) }, (_, i) => {
      if (this.totalPages <= this._maxPageButtons) return i + 1;
      if (this.currentPage <= 3) return i + 1;
      if (this.currentPage >= this.totalPages - 2) {
        return this.totalPages - this._maxPageButtons + 1 + i;
      }
      return this.currentPage - Math.floor(this._maxPageButtons / 2) + i;
    });
  }
  

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    
    this.currentPage = page;
    this._emitPageChange();
  }
  

  onSearch(): void {
    this._resetToFirstPage();
    this.searchChange.emit(this.searchTerm);
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

  private _resetToFirstPage(): void {
    this.currentPage = 1;
    this._emitPageChange();
  }
  

  private _emitPageChange(): void {
    this.pageChange.emit({
      pageIndex: this.currentPage - 1,  
      pageSize: this.pageSize,
      page: this.currentPage 
    });
  }
}