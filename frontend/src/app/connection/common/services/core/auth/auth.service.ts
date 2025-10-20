// auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CheckEmailResponse, VerifyCodeResponse } from '../../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3001/api';

  checkEmail(email: string, isPro: boolean = false): Observable<CheckEmailResponse> {
    console.log('🔵 Auth Service - checkEmail appelé');
    console.log('📧 Email reçu:', email);
    console.log('🏢 Mode Pro:', isPro);
    
    const payload = { 
      email: email.trim(),
      isPro 
    };
    
    return this.http.post<CheckEmailResponse>(
      `${this.apiUrl}/auth/check-email`,
      payload,
      { 
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        withCredentials: true
      }
    ).pipe(
      tap({
        next: (response) => console.log('✅ Réponse du serveur:', response),
        error: (error) => console.error('❌ Erreur dans le service:', error)
      })
    );
  }

  saveUserInfo(payload: any, isPro: boolean = false): Observable<{ success: boolean; message: string }> {
    console.log('👤 Auth Service - saveUserInfo appelé');
    console.log('📦 Données:', payload);
    console.log('🏢 Mode Pro:', isPro);
    
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/auth/save-user-info`,
      { ...payload, isPro },
      { withCredentials: true }
    ).pipe(
      tap({
        next: (response) => console.log('✅ Informations sauvegardées:', response),
        error: (error) => console.error('❌ Erreur lors de la sauvegarde:', error)
      })
    );
  }

  setPassword(password: string, isPro: boolean = false): Observable<{ success: boolean; message: string; user?: any }> {
    console.log('🔐 Auth Service - setPassword appelé');
    console.log('🏢 Mode Pro:', isPro);
    
    return this.http.post<{ success: boolean; message: string; user?: any }>(
      `${this.apiUrl}/auth/set-password`,
      { password, isPro },
      { withCredentials: true }
    ).pipe(
      tap({
        next: (response) => console.log('✅ Mot de passe défini:', response),
        error: (error) => console.error('❌ Erreur:', error)
      })
    );
  }

  loginWithPassword(password: string, isPro: boolean = false): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login-with-password`, 
      { password, isPro },
      { withCredentials: true }
    );
  }

  verifyCode(email: string, code: string, isPro: boolean = false): Observable<VerifyCodeResponse> {
    return this.http.post<VerifyCodeResponse>(
      `${this.apiUrl}/auth/verify-code`,
      { email: email.trim(), code, isPro },
      { withCredentials: true }
    ).pipe(
      tap({
        next: (response) => {
          console.log('✅ Code vérifié et cookie reçu:', response);
        },
        error: (error) => {
          console.error('❌ Erreur lors de la vérification:', error);
        }
      })
    );
  }

  getCurrentUser(): Observable<{ success: boolean; user: any }> {
    return this.http.get<{ success: boolean; user: any }>(
      `${this.apiUrl}/auth/me`,
      { withCredentials: true }
    ).pipe(
      tap({
        next: (response) => console.log('✅ Utilisateur récupéré:', response),
        error: (error) => console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error)
      })
    );
  }

  logout(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/auth/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap({
        next: (response) => console.log('✅ Déconnexion:', response),
        error: (error) => console.error('❌ Erreur lors de la déconnexion:', error)
      })
    );
  }
}