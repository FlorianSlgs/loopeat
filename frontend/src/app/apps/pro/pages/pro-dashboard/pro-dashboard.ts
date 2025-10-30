// src/app/apps/pro/components/pro-dashboard/pro-dashboard.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProAccountsService } from '../../common/services/pro-accounts/pro-accounts.service';
import { ProBorrowService, BoxInventoryItem } from '../../common/services/pro-borrow/pro-borrow.service';

@Component({
  selector: 'app-pro-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pro-dashboard.html',
  styleUrls: ['./pro-dashboard.css']
})
export class ProDashboard implements OnInit {
  private readonly router = inject(Router);
  private readonly proAccountsService = inject(ProAccountsService);
  private readonly proBorrowService = inject(ProBorrowService);

  // Signaux pour les données affichées
  userName = signal('');
  proCode = signal('');
  cleanBoxes = signal(0);
  dirtyBoxes = signal(0);
  inventory = signal<BoxInventoryItem[]>([]);
  isLoadingInventory = signal(true);
  
  // Mapping des types vers les images
  private readonly boxTypeImages: Record<number, string> = {
    1: 'verre-salade.webp',
    2: 'plastique-salade.webp',
    3: 'frites.jpg',
    4: 'pizza.png',
    5: 'gobelet.jpg',
    6: 'burger.jpg'
  };
  
  // Propriété pour le champ de formulaire
  customerCode = '';

  ngOnInit() {
    this.loadProInfo();
    this.loadInventory();
  }

  /**
   * Charger les informations du professionnel
   */
  loadProInfo() {
    this.proAccountsService.getBasicInfo().subscribe({
      next: (response) => {
        if (response.success) {
          const data = response.data;
          this.userName.set(data.name || '');
          this.proCode.set(data.code || '');
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des infos pro:', error);
      }
    });
  }

  /**
   * Charger l'inventaire des boîtes
   */
  loadInventory() {
    this.isLoadingInventory.set(true);
    this.proBorrowService.getInventory().subscribe({
      next: (response) => {
        if (response.success) {
          this.inventory.set(response.inventory);
          this.cleanBoxes.set(response.totals.totalClean);
          this.dirtyBoxes.set(response.totals.totalDirty);
        }
        this.isLoadingInventory.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'inventaire:', error);
        this.isLoadingInventory.set(false);
      }
    });
  }

  /**
   * Obtenir l'image pour un type de boîte
   */
  getBoxImage(type: number): string {
    return this.boxTypeImages[type] || 'default-box.png';
  }
  
  /**
   * Prêter des boîtes - Redirige vers la page de sélection
   */
  lendBoxes() {
    if (this.customerCode.trim()) {
      if (!/^\d{4}$/.test(this.customerCode.trim())) {
        alert('Le code client doit être composé de 4 chiffres');
        return;
      }

      this.router.navigate(['/pro/borrow/select'], {
        queryParams: { code: this.customerCode.trim() }
      });
      
      this.customerCode = '';
    } else {
      alert('Veuillez entrer un code client');
    }
  }
  
  /**
 * Rendre des boîtes
 */
  returnBoxes() {
    if (this.customerCode.trim()) {
      if (!/^\d{4}$/.test(this.customerCode.trim())) {
        alert('Le code client doit être composé de 4 chiffres');
        return;
      }

      this.router.navigate(['/pro/give-back/validate'], {
        queryParams: { code: this.customerCode.trim() }
      });
      
      this.customerCode = '';
    } else {
      alert('Veuillez entrer un code client');
    }
  }
}