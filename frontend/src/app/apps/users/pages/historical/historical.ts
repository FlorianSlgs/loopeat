// historical.ts
import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../common/services/payment/payment';
import { BalanceHistoryItem } from '../../common/models/payment.model';

@Component({
  selector: 'app-historical',
  imports: [CommonModule],
  templateUrl: './historical.html',
  styleUrl: './historical.css'
})
export class Historical implements OnInit {
  private paymentService = inject(PaymentService);

  // State
  transactions = signal<BalanceHistoryItem[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadHistory();
  }

  /**
   * Charger l'historique des transactions depuis le backend
   */
  loadHistory() {
    this.isLoading.set(true);
    this.paymentService.getBalanceHistory().subscribe({
      next: (response) => {
        if (response.success) {
          this.transactions.set(response.history);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'historique:', error);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Obtenir le montant d'une transaction (positif ou négatif)
   */
  getAmount(transaction: BalanceHistoryItem): number {
    if (transaction.add !== null) {
      return transaction.add;
    }
    if (transaction.subtract !== null) {
      return -transaction.subtract;
    }
    return 0;
  }

  /**
   * Déterminer si c'est un ajout ou un retrait
   */
  isAddition(transaction: BalanceHistoryItem): boolean {
    return transaction.add !== null && transaction.add > 0;
  }

  /**
   * Formater la date en format lisible
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  /**
   * Obtenir la valeur absolue d'un montant
   */
  getAbsoluteAmount(transaction: BalanceHistoryItem): number {
    return Math.abs(this.getAmount(transaction));
  }
}