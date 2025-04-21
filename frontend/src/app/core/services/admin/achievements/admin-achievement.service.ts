import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AchievementResponse, IAchievement } from '../../../models/admin/achievements.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminAchievementService {

  private baseUrl=`${environment.baseUrl}/admin/achievements`;

  constructor(private http: HttpClient) { }

  getAchievementsWithPagination(page: number, limit: number): Observable<AchievementResponse> {
    return this.http.get<AchievementResponse>(`${this.baseUrl}?page=${page}&limit=${limit}`,{withCredentials:true});
  }

  getAchievementById(achievementId: string): Observable<{ success: boolean; data: IAchievement }> {
    return this.http.get<{ success: boolean; data: IAchievement }>(`${this.baseUrl}/${achievementId}`,{withCredentials:true});
  }

  createAchievement(achievement: IAchievement): Observable<{ success: boolean; data: IAchievement }> {
    return this.http.post<{ success: boolean; data: IAchievement }>(this.baseUrl, achievement,{withCredentials:true});
  }

  updateAchievement(achievementId: string, achievement: IAchievement): Observable<{ success: boolean; data: IAchievement }> {
    return this.http.put<{ success: boolean; data: IAchievement }>(`${this.baseUrl}/${achievementId}`, achievement,{withCredentials:true});
  }

  deleteAchievement(achievementId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${achievementId}`,{withCredentials:true});
  }

  activateAchievement(achievementId: string): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.baseUrl}/${achievementId}/activate`,{},{withCredentials:true});
  }

  deactivateAchievement(achievementId: string): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.baseUrl}/${achievementId}/deactivate`,{},{withCredentials:true});
  }
}
