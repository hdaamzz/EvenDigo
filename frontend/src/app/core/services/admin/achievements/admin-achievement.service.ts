import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AchievementResponse, IAchievement } from '../../../models/admin/achievements.interface';


@Injectable({
  providedIn: 'root'
})
export class AdminAchievementService {
  private readonly apiUrl = `${environment.apiUrl}admin/achievements`;

  constructor(private readonly _http: HttpClient) { }


  getAchievementsWithPagination(page: number, limit: number): Observable<AchievementResponse> {
    return this._http.get<AchievementResponse>(
      `${this.apiUrl}?page=${page}&limit=${limit}`,
      
    );
  }
  getAchievementById(achievementId: string): Observable<{ success: boolean; data: IAchievement }> {
    return this._http.get<{ success: boolean; data: IAchievement }>(
      `${this.apiUrl}/${achievementId}`,
      
    );
  }


  createAchievement(achievement: IAchievement): Observable<{ success: boolean; data: IAchievement }> {
    return this._http.post<{ success: boolean; data: IAchievement }>(
      this.apiUrl, 
      achievement,
      
    );
  }


  updateAchievement(achievementId: string, achievement: IAchievement): Observable<{ success: boolean; data: IAchievement }> {
    return this._http.put<{ success: boolean; data: IAchievement }>(
      `${this.apiUrl}/${achievementId}`, 
      achievement,
      
    );
  }


  deleteAchievement(achievementId: string): Observable<{ success: boolean; message: string }> {
    return this._http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${achievementId}`,
      
    );
  }


  activateAchievement(achievementId: string): Observable<{ success: boolean; message: string }> {
    return this._http.patch<{ success: boolean; message: string }>(
      `${this.apiUrl}/${achievementId}/activate`,
      {},
      
    );
  }


  deactivateAchievement(achievementId: string): Observable<{ success: boolean; message: string }> {
    return this._http.patch<{ success: boolean; message: string }>(
      `${this.apiUrl}/${achievementId}/deactivate`,
      {},
      
    );
  }
}