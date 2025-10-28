// src/app/apps/pro/components/pro-dashboard/pro-dashboard.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pro-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pro-dashboard.html',
  styleUrls: ['./pro-dashboard.css']
})
export class ProDashboard {
  private readonly router = inject(Router);

  // Signaux pour les données affichées
  userName = signal('Jean Dupont');
  lentBoxes = signal(42);
  returnedBoxes = signal(38);
  cleanBoxes = signal(156);
  dirtyBoxes = signal(24);
  
  // Propriété pour le champ de formulaire
  customerCode = '';
  
  /**
   * Prêter des boîtes - Redirige vers la page de sélection
   */
  lendBoxes() {
    if (this.customerCode.trim()) {
      // Valider que le code est bien composé de 4 chiffres
      if (!/^\d{4}$/.test(this.customerCode.trim())) {
        alert('Le code client doit être composé de 4 chiffres');
        return;
      }

      console.log('Prêter des boîtes au client:', this.customerCode);
      
      // Rediriger vers la page de sélection des boîtes avec le code client
      this.router.navigate(['/pro/borrow/select'], {
        queryParams: { code: this.customerCode.trim() }
      });
      
      this.customerCode = '';
    } else {
      alert('Veuillez entrer un code client');
    }
  }
  
  /**
   * Rendre des boîtes (fonctionnalité existante)
   */
  returnBoxes() {
    if (this.customerCode.trim()) {
      console.log('Rendre des boîtes du client:', this.customerCode);
      // Logique à implémenter
      alert(`Rendre des boîtes du client: ${this.customerCode}`);
      this.returnedBoxes.set(this.returnedBoxes() + 1);
      this.dirtyBoxes.set(this.dirtyBoxes() + 1);
      this.customerCode = '';
    } else {
      alert('Veuillez entrer un code client');
    }
  }
}