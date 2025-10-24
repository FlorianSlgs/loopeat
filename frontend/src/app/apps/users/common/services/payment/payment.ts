// payment.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment.development';

export interface RechargeResponse {
  success: boolean;
  url: string;
  sessionId: string;
}

export interface SessionDetails {
  success: boolean;
  session: {
    id: string;
    status: string;
    amount: number;
    currency: string;
  };
}

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
}