// historical.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../common/services/payment/payment';
import { BalanceHistoryItem } from '../../common/models/payment.model';

interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  isAddition: boolean;
}

@Component({
  selector: 'app-historical',
  imports: [CommonModule],
  templateUrl: './historical.html',
  styleUrl: './historical.css'
})
export class Historical implements OnInit {
  private paymentService = inject(PaymentService);

  // State
  transactions = signal<Transaction[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadHistory();
  }

  /**
   * Charger l'historique complet depuis balance_history uniquement
   */
  loadHistory() {
    this.isLoading.set(true);

    this.paymentService.getBalanceHistory().subscribe({
      next: (response) => {
        if (response.success && response.history) {
          const allTransactions: Transaction[] = response.history.map((item: BalanceHistoryItem) => {
            const isAddition = item.add !== null && item.add > 0;
            // ✅ S'assurer que amount est toujours un nombre
            const amount = isAddition ? (item.add || 0) : (item.subtract || 0);

            return {
              id: `transaction-${item.id}`,
              title: item.title,
              date: item.created,
              amount: amount, // ✅ Maintenant c'est toujours un number
              isAddition: isAddition
            };
          });

          this.transactions.set(allTransactions);
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
   * Déterminer si c'est un ajout (positif)
   */
  isAddition(transaction: Transaction): boolean {
    return transaction.isAddition;
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
  getAbsoluteAmount(transaction: Transaction): number {
    return Math.abs(transaction.amount);
  }

  /**
   * Obtenir l'icône selon le type de transaction
   */
  getIcon(transaction: Transaction): string {
    // Déterminer le type selon le titre
    const title = transaction.title.toLowerCase();
    
    if (title.includes('rendue') || title.includes('retour')) {
      return 'stockpot'; // Boîtes rendues
    }
    if (title.includes('emprunt')) {
      return 'lunch_dining'; // Boîtes empruntées
    }
    // Rechargement
    return 'add_card';
  }
}