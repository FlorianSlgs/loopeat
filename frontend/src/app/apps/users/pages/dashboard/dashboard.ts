// dashboard.ts
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardMap } from './dashboard-map/dashboard-map';
import { PaymentService } from '../../common/services/payment/payment';

@Component({
  selector: 'app-dashboard',
  imports: [DashboardMap, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  private paymentService = inject(PaymentService); // Instance injectable
  
  // State
  showRechargeMenu = signal(false);
  isLoading = signal(false);
  balance = signal(12); // À remplacer par les vraies données utilisateur
  userName = signal('John Deer');
  borrowedBoxes = signal(3);
  customerCode = signal('1234');
  
  // Montants prédéfinis pour le rechargement
  rechargeAmounts = [5, 10, 20, 50];
  
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
  
  // Fermer le menu si on clique en dehors
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.recharge-container')) {
      this.closeRechargeMenu();
    }
  }
}