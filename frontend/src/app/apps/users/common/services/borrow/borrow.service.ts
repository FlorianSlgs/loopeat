// src/app/common/services/borrow/borrow.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment.development';
import {
  UserBorrowProposalGroup,
  UserProposalDetails
} from '../../models/borrow.model';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  proposal?: T;
  proposals?: T[];
}

@Injectable({
  providedIn: 'root'
})
export class BorrowService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/borrow`;

  /**
   * Récupérer une proposition par ID
   */
  getProposal(proposalId: string): Observable<ApiResponse<UserProposalDetails>> {
    return this.http.get<ApiResponse<UserProposalDetails>>(
      `${this.apiUrl}/proposal/${proposalId}`,
      { withCredentials: true }
    );
  }

  /**
   * Récupérer les propositions en attente
   */
  getPendingProposals(): Observable<ApiResponse<UserBorrowProposalGroup>> {
    return this.http.get<ApiResponse<UserBorrowProposalGroup>>(
      `${this.apiUrl}/pending`,
      { withCredentials: true }
    );
  }

  /**
   * Accepter une proposition
   */
  acceptProposal(proposalId: string): Observable<ApiResponse<UserProposalDetails>> {
    return this.http.post<ApiResponse<UserProposalDetails>>(
      `${this.apiUrl}/accept/${proposalId}`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * Refuser une proposition
   */
  rejectProposal(proposalId: string): Observable<ApiResponse<{ id: string }>> {
    return this.http.post<ApiResponse<{ id: string }>>(
      `${this.apiUrl}/reject/${proposalId}`,
      {},
      { withCredentials: true }
    );
  }
}