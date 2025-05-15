import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CloudinaryResponse } from '../../models/userModel';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  uploadProfileImage(file: File): Observable<CloudinaryResponse> {
    const formData = new FormData();
    formData.append('profileImage', file);
    console.log(formData);
    
    
    return this.http.post<CloudinaryResponse>(
      `${this.baseUrl}user/profile/image`, 
      formData
    );
  }
}