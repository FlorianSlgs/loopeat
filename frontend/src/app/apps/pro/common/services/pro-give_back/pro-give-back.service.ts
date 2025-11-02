// src/app/apps/pro/common/services/pro-give-back/pro-give-back.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

export interface BorrowedBoxItem {
  id: string;
  number: number;
  borrowedDate: string;
  proName: string;
}

export interface BorrowedBoxGroup {
  type: number;
  label: string;
  totalNumber: number;
  items: BorrowedBoxItem[];
}

export interface UserBorrowsResponse {
  success: boolean;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  borrows: BorrowedBoxGroup[];
}

export interface ReturnItem {
  type: number;
  number: number;
}

export interface ReturnedItem {
  id: string;
  type: number;
  number: number;
  refund: number;
}

export interface RecordGiveBackResponse {
  success: boolean;
  message: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  returnedItems: ReturnedItem[];
  totalRefund: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProGiveBackService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/give-back`;

  /**
   * Récupérer les boîtes empruntées d'un utilisateur par son code
   */
  getUserBorrows(userCode: string): Observable<UserBorrowsResponse> {
    return this.http.get<UserBorrowsResponse>(
      `${this.apiUrl}/user-borrows/${userCode}`,
      { withCredentials: true }
    );
  }

  /**
   * Enregistrer le retour de boîtes
   */
  recordGiveBack(userCode: string, items: ReturnItem[]): Observable<RecordGiveBackResponse> {
    return this.http.post<RecordGiveBackResponse>(
      `${this.apiUrl}/record`,
      { userCode, items },
      { withCredentials: true }
    );
  }
}