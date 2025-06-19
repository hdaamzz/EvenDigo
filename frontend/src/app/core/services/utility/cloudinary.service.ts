import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CloudinaryResponse } from '../../models/userModel';

interface SecureImageCache {
  [publicId: string]: {
    url: string;
    expiresAt: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private baseUrl = environment.baseUrl;
  private imageCache: SecureImageCache = {};
  private cacheExpiryBuffer = 5 * 60 * 1000; 

  constructor(private http: HttpClient) {}

  uploadProfileImage(file: File): Observable<CloudinaryResponse> {
    const formData = new FormData();
    formData.append('profileImage', file);
    
    return this.http.post<CloudinaryResponse>(
      `${this.baseUrl}user/profile/image`, 
      formData
    ).pipe(
      tap(response => {
        if (response.success && response.publicId && response.imageUrl) {
          this.cacheSecureUrl(response.publicId, response.imageUrl);
        }
      }),
      catchError(this.handleError)
    );
  }

  refreshImageUrl(publicId: string): Observable<{ imageUrl: string }> {
    return this.http.post<{ success: boolean; data: { imageUrl: string }; message: string }>(
      `${this.baseUrl}user/profile/refresh-url`,
      { publicId }
    ).pipe(
      tap(response => {
        if (response.success) {
          this.cacheSecureUrl(publicId, response.data.imageUrl);
        }
      }),
      switchMap(response => 
        response.success 
          ? of({ imageUrl: response.data.imageUrl })
          : throwError(() => new Error(response.message))
      ),
      catchError(this.handleError)
    );
  }

  getSecureImageUrl(publicId: string, fallbackUrl?: string): Observable<string> {
    const cached = this.imageCache[publicId];
    if (cached && this.isUrlValid(cached)) {
      return of(cached.url);
    }

    if (!publicId && fallbackUrl) {
      return of(fallbackUrl);
    }

    return this.refreshImageUrl(publicId).pipe(
      switchMap(response => of(response.imageUrl)),
      catchError(error => {
        console.warn('Failed to refresh image URL:', error);
        return of(fallbackUrl || this.getDefaultImageUrl());
      })
    );
  }

  private cacheSecureUrl(publicId: string, url: string): void {
    const expiresAt = this.extractExpiryFromUrl(url) || (Date.now() + (23 * 60 * 60 * 1000));
    
    this.imageCache[publicId] = {
      url,
      expiresAt
    };
  }

  private isUrlValid(cached: { url: string; expiresAt: number }): boolean {
    return Date.now() < (cached.expiresAt - this.cacheExpiryBuffer);
  }

  private extractExpiryFromUrl(url: string): number | null {
    try {
      const urlObj = new URL(url);
      const expiresAt = urlObj.searchParams.get('expires_at');
      return expiresAt ? parseInt(expiresAt) * 1000 : null;
    } catch {
      return null;
    }
  }

  private getDefaultImageUrl(): string {
    return 'https://res.cloudinary.com/dfpezlzsy/image/upload/v1741318747/user.icon_slz5l0.png';
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  clearExpiredCache(): void {
    const now = Date.now();
    Object.keys(this.imageCache).forEach(publicId => {
      if (!this.isUrlValid(this.imageCache[publicId])) {
        delete this.imageCache[publicId];
      }
    });
  }
}