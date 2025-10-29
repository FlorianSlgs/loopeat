// dashboard.ts
import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardMap } from './dashboard-map/dashboard-map';
import { PaymentService } from '../../common/services/payment/payment';
import { AccountsService } from '../../common/services/accounts/accounts.services';
import { BorrowService } from '../../common/services/borrow/borrow.service';

@Component({
  selector: 'app-dashboard',
  imports: [DashboardMap, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private paymentService = inject(PaymentService);
  private accountsService = inject(AccountsService);
  private borrowService = inject(BorrowService); // 🆕

  // State
  showRechargeMenu = signal(false);
  isLoading = signal(false);
  balance = signal(0);
  userName = signal('');
  borrowedBoxes = signal(0); // 🆕 Maintenant chargé depuis le backend
  customerCode = signal('');

  // Montants prédéfinis pour le rechargement
  rechargeAmounts = [5, 10, 20, 50];

  ngOnInit() {
    this.loadUserBasicInfo();
    this.loadUserBalance();
    this.loadBorrowedBoxes(); // 🆕
  }

  /**
   * Charger le code et le nom de l'utilisateur
   */
  loadUserBasicInfo() {
    this.accountsService.getBasicInfo().subscribe({
      next: (response) => {
        if (response.success) {
          const data = response.data;
          
          // Code client
          this.customerCode.set(data.code);
          
          // Nom selon le type d'utilisateur
          if (data.isPro) {
            this.userName.set(data.name || '');
          } else {
            this.userName.set(`${data.firstName || ''} ${data.lastName || ''}`.trim());
          }
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des infos utilisateur:', error);
      }
    });
  }

  /**
   * Charger le solde de l'utilisateur depuis le backend (PaymentService)
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
      }
    });
  }

  /**
   * 🆕 Charger le nombre de boîtes empruntées
   */
  loadBorrowedBoxes() {
    this.borrowService.getActiveBorrows().subscribe({
      next: (response) => {
        if (response.success) {
          this.borrowedBoxes.set(response.totalBoxes);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des boîtes empruntées:', error);
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

  /**
   * 🆕 Recharger le nombre de boîtes empruntées
   */
  refreshBorrowedBoxes() {
    this.loadBorrowedBoxes();
  }
  
  // Fermer le menu si on clique en dehors
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.recharge-container')) {
      this.closeRechargeMenu();
    }
  }
}