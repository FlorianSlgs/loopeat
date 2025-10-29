// pro-historical.ts
import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProBorrowService, MonthlyHistoryRecord } from '../../common/services/pro-borrow/pro-borrow.service';

@Component({
  selector: 'app-pro-historical',
  imports: [CommonModule],
  templateUrl: './pro-historical.html',
  styleUrl: './pro-historical.css'
})
export class ProHistorical implements OnInit {
  private proBorrowService = inject(ProBorrowService);

  // State
  monthlyHistory = signal<MonthlyHistoryRecord[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.loadMonthlyHistory();
  }

  /**
   * Charger l'historique mensuel depuis le backend
   */
  loadMonthlyHistory() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.proBorrowService.getMonthlyHistory(12).subscribe({
      next: (response) => {
        if (response.success) {
          this.monthlyHistory.set(response.history);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'historique:', error);
        this.errorMessage.set('Impossible de charger l\'historique mensuel');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Formater le mois en format lisible (ex: "Janvier 2025")
   */
  formatMonth(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Obtenir le texte pour le nombre de boîtes
   */
  getBoxesText(numberOfBoxes: number): string {
    if (numberOfBoxes === 0) {
      return 'Aucune boîte empruntée';
    }
    if (numberOfBoxes === 1) {
      return '1 boîte empruntée';
    }
    return `${numberOfBoxes} boîtes empruntées`;
  }

  /**
   * Recharger l'historique
   */
  refresh() {
    this.loadMonthlyHistory();
  }
}