// src/app/apps/pro/services/pro-borrow.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment.development';
import {
  CreateProposalRequest,
  CreateProposalResponse,
  ProBorrowProposalGroup,
  ProProposalDetails
} from '../../models/pro-borrow.model';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  proposal?: T;
  proposals?: T[];
}

@Injectable({
  providedIn: 'root'
})
export class ProBorrowService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/borrow`;

  /**
   * Créer une proposition d'emprunt
   */
  createProposal(request: CreateProposalRequest): Observable<CreateProposalResponse> {
    return this.http.post<CreateProposalResponse>(
      `${this.apiUrl}/propose`, 
      request,
      { withCredentials: true }  // ← Ajouter ici
    );
  }

  /**
   * Récupérer une proposition par ID
   */
  getProposal(proposalId: string): Observable<ApiResponse<ProProposalDetails>> {
    return this.http.get<ApiResponse<ProProposalDetails>>(
      `${this.apiUrl}/proposal/${proposalId}`,
      { withCredentials: true }  // ← Ajouter ici
    );
  }

  /**
   * Récupérer toutes les propositions actives du professionnel
   */
  getMyProposals(): Observable<ApiResponse<ProBorrowProposalGroup>> {
    return this.http.get<ApiResponse<ProBorrowProposalGroup>>(
      `${this.apiUrl}/my-proposals`,
      { withCredentials: true }  // ← Ajouter ici
    );
  }

  /**
   * Annuler une proposition
   */
  cancelProposal(proposalId: string): Observable<ApiResponse<{ id: string; accepted: boolean }>> {
    return this.http.post<ApiResponse<{ id: string; accepted: boolean }>>(
      `${this.apiUrl}/cancel/${proposalId}`,
      {},
      { withCredentials: true }  // ← Ajouter ici
    );
  }
}