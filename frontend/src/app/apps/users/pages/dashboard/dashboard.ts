// dashboard.ts
import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardMap } from './dashboard-map/dashboard-map';
import { PaymentService } from '../../common/services/payment/payment';

@Component({
  selector: 'app-dashboard',
  imports: [DashboardMap, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private paymentService = inject(PaymentService); // Instance injectable

  // State
  showRechargeMenu = signal(false);
  isLoading = signal(false);
  balance = signal(0); // Sera chargé depuis le backend
  userName = signal('John Deer');
  borrowedBoxes = signal(3);
  customerCode = signal('1234');

  // Montants prédéfinis pour le rechargement
  rechargeAmounts = [5, 10, 20, 50];

  ngOnInit() {
    this.loadUserBalance();
  }

  /**
   * Charger le solde de l'utilisateur depuis le backend
   */
  loadUserBalance() {
    this.paymentService.getUserBalance().subscribe({
      next: (response) => {
        if (response.success) {
          this.balance.set(response.balance);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement du solde:', error);
        // En cas d'erreur, on garde la valeur par défaut (0)
      }
    });
  }
  
  toggleRechargeMenu() {
    this.showRechargeMenu.update(value => !value);
  }
  
  closeRechargeMenu() {
    this.showRechargeMenu.set(false);
  }
  
  async recharge(amount: number) {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.closeRechargeMenu();

    try {
      const response = await this.paymentService.createRechargeSession(amount).toPromise();

      if (response?.success && response.url) {
        // Rediriger vers Stripe Checkout
        window.location.href = response.url;
      }
    } catch (error) {
      console.error('Erreur lors de la création de la session de paiement:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
      this.isLoading.set(false);
    }
  }

  /**
   * Recharger le solde (à appeler après un paiement réussi)
   */
  refreshBalance() {
    this.loadUserBalance();
  }
  
  // Fermer le menu si on clique en dehors
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.recharge-container')) {
      this.closeRechargeMenu();
    }
  }
}