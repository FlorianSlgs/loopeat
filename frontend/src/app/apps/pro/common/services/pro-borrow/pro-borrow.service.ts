// src/app/apps/pro/services/pro-borrow.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment.development';
import {
  CreateProposalRequest,
  CreateProposalResponse,
  ProBorrowProposalGroup,
  ProProposalDetails,
  BatchProposalsResponse
} from '../../models/pro-borrow.model';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  proposal?: T;
  proposals?: T[];
  history?: T[];
}

// Interfaces pour l'inventaire
export interface BoxInventoryItem {
  type: number;
  label: string;
  clean: number;
  dirty: number;
  total: number;
}

export interface BoxInventoryTotals {
  totalClean: number;
  totalDirty: number;
  totalBoxes: number;
}

export interface BoxInventoryResponse {
  success: boolean;
  inventory: BoxInventoryItem[];
  totals: BoxInventoryTotals;
}

// 🆕 Interfaces pour l'historique mensuel
export interface MonthlyHistoryRecord {
  id: string;
  month: string;
  numberOfBoxes: number;
  created: string;
  lastUpdate: string;
}

export interface MonthlyHistoryResponse {
  success: boolean;
  history: MonthlyHistoryRecord[];
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
      { withCredentials: true }
    );
  }

  /**
   * Récupérer une proposition par ID
   */
  getProposal(proposalId: string): Observable<ApiResponse<ProProposalDetails>> {
    return this.http.get<ApiResponse<ProProposalDetails>>(
      `${this.apiUrl}/proposal/${proposalId}`,
      { withCredentials: true }
    );
  }

  /**
   * Récupérer toutes les propositions d'un batch par batch_id
   */
  getBatchProposals(batchId: string): Observable<BatchProposalsResponse> {
    return this.http.get<BatchProposalsResponse>(
      `${this.apiUrl}/batch/${batchId}`,
      { withCredentials: true }
    );
  }

  /**
   * Récupérer toutes les propositions actives du professionnel
   */
  getMyProposals(): Observable<ApiResponse<ProBorrowProposalGroup>> {
    return this.http.get<ApiResponse<ProBorrowProposalGroup>>(
      `${this.apiUrl}/my-proposals`,
      { withCredentials: true }
    );
  }

  /**
   * Annuler une proposition
   */
  cancelProposal(proposalId: string): Observable<ApiResponse<{ id: string; accepted: boolean }>> {
    return this.http.post<ApiResponse<{ id: string; accepted: boolean }>>(
      `${this.apiUrl}/cancel/${proposalId}`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * Récupérer l'inventaire des boîtes du professionnel
   */
  getInventory(): Observable<BoxInventoryResponse> {
    return this.http.get<BoxInventoryResponse>(
      `${this.apiUrl}/inventory`,
      { withCredentials: true }
    );
  }

  /**
   * 🆕 Récupérer l'historique mensuel des emprunts
   */
  getMonthlyHistory(limit: number = 12): Observable<MonthlyHistoryResponse> {
    return this.http.get<MonthlyHistoryResponse>(
      `${this.apiUrl}/monthly-history?limit=${limit}`,
      { withCredentials: true }
    );
  }
}