// common/services/accounts/accounts.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

export interface UserBasicInfo {
  id: number;
  email: string;
  code: string;
  isPro: boolean;
  // Champs optionnels selon le type
  firstName?: string;
  lastName?: string;
  name?: string;
}

export interface BasicInfoResponse {
  success: boolean;
  data: UserBasicInfo;
}

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/accounts`;

  /**
   * Récupérer le code et le nom de l'utilisateur
   */
  getBasicInfo(): Observable<BasicInfoResponse> {
    return this.http.get<BasicInfoResponse>(`${this.apiUrl}/info`, {
      withCredentials: true
    });
  }
}