// payment.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment.development';
import { RechargeResponse, SessionDetails, BalanceResponse, BalanceHistoryItem, BalanceHistoryResponse } from '../../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/payment`;

  createRechargeSession(amount: number): Observable<RechargeResponse> {
    return this.http.post<RechargeResponse>(
      `${this.apiUrl}/create-recharge-session`,
      { amount },
      { withCredentials: true }
    );
  }

  verifySession(sessionId: string): Observable<SessionDetails> {
    return this.http.get<SessionDetails>(
      `${this.apiUrl}/verify-session/${sessionId}`,
      { withCredentials: true }
    );
  }

  getUserBalance(): Observable<BalanceResponse> {
    return this.http.get<BalanceResponse>(
      `${this.apiUrl}/balance`,
      { withCredentials: true }
    );
  }

  getBalanceHistory(limit: number = 50): Observable<BalanceHistoryResponse> {
    return this.http.get<BalanceHistoryResponse>(
      `${this.apiUrl}/history?limit=${limit}`,
      { withCredentials: true }
    );
  }
}