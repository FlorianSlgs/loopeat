import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    private readonly http = inject(HttpClient);

  /**
   * Obtenir un token WebSocket temporaire
   * Le cookie httpOnly est automatiquement envoyé avec withCredentials: true
   */
  getWebSocketToken(): Observable<{ success: boolean; wsToken: string }> {
    return this.http.get<{ success: boolean; wsToken: string }>(
      `${environment.apiUrl}/auth/ws-token`,
      { withCredentials: true }
    );
  }
}
