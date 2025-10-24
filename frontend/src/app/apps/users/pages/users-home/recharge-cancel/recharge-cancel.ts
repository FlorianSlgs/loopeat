// recharge-cancel.component.ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recharge-cancel',
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div class="mb-6">
          <span class="material-symbols-outlined text-orange-500 text-6xl">
            cancel
          </span>
        </div>
        
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          Paiement annulé
        </h1>
        
        <p class="text-gray-600 mb-6">
          Votre rechargement a été annulé. Aucun montant n'a été débité.
        </p>
        
        <div class="space-y-3">
          <button
            (click)="goToDashboard()"
            class="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors cursor-pointer"
            type="button">
            Retour à l'application
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RechargeCancelComponent {
  private router = inject(Router);
  
  goToDashboard() {
    this.router.navigate(['/utilisateurs']);
  }
}