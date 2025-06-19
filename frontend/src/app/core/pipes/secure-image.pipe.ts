import { Pipe, PipeTransform } from '@angular/core';
import { CloudinaryService } from '../services/utility/cloudinary.service';
import { Observable, of } from 'rxjs';

@Pipe({
  name: 'secureImage',
  standalone: true,
  pure: false
})
export class SecureImagePipe implements PipeTransform {

 private cachedResults: { [key: string]: string } = {};

  constructor(private cloudinaryService: CloudinaryService) {}

  transform(publicId: string | null | undefined, fallbackUrl?: string): Observable<string> {
    if (!publicId) {
      return of(fallbackUrl || this.getDefaultImage());
    }

    const cacheKey = `${publicId}_${fallbackUrl || ''}`;
    if (this.cachedResults[cacheKey]) {
      return of(this.cachedResults[cacheKey]);
    }

    return new Observable(observer => {
      this.cloudinaryService.getSecureImageUrl(publicId, fallbackUrl).subscribe({
        next: (url) => {
          this.cachedResults[cacheKey] = url;
          observer.next(url);
          observer.complete();
        },
        error: (error) => {
          console.warn('SecureImagePipe error:', error);
          const defaultUrl = fallbackUrl || this.getDefaultImage();
          this.cachedResults[cacheKey] = defaultUrl;
          observer.next(defaultUrl);
          observer.complete();
        }
      });
    });
  }

  private getDefaultImage(): string {
    return 'https://res.cloudinary.com/dfpezlzsy/image/upload/v1741318747/user.icon_slz5l0.png';
  }
}
