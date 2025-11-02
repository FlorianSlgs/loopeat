// pro-accounts.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

export interface ProBasicInfo {
  id: number;
  email: string;
  code: string;
  isPro: boolean;
  name: string; // Pour les pros
}

export interface ProBasicInfoResponse {
  success: boolean;
  data: ProBasicInfo;
}

@Injectable({
  providedIn: 'root'
})
export class ProAccountsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/accounts`;

  /**
   * Récupérer le code et le nom du professionnel
   */
  getBasicInfo(): Observable<ProBasicInfoResponse> {
    return this.http.get<ProBasicInfoResponse>(`${this.apiUrl}/info`, {
      withCredentials: true
    });
  }
}