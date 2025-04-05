import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {

  transform(value: string, limit: number = 100, ellipsis: string = '...', byWords: boolean = false): string {
    if (!value) return '';
    
    if (byWords) {
      // Split by words and limit by word count
      const words = value.split(/\s+/);
      if (words.length > limit) {
        return words.slice(0, limit).join(' ') + ellipsis;
      }
      return value;
    } else {
      // Original behavior - limit by character count
      if (value.length > limit) {
        return value.slice(0, limit) + ellipsis;
      }
      return value;
    }
  }
}