// recharge-success.component.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../common/services/payment/payment';

@Component({
  selector: 'app-recharge-success',
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        @if (isLoading()) {
          <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Vérification du paiement...</p>
        } @else if (sessionDetails()) {
          <div class="mb-6">
            <span class="material-symbols-outlined text-emerald-600 text-6xl">
              check_circle
            </span>
          </div>
          
          <h1 class="text-2xl font-bold text-gray-900 mb-2">
            Rechargement réussi !
          </h1>
          
          <p class="text-gray-600 mb-6">
            Votre compte a été crédité de 
            <span class="font-bold text-emerald-600">
              {{ sessionDetails()?.session.amount }} {{ sessionDetails()?.session.currency.toUpperCase() }}
            </span>
          </p>
          
          <button
            (click)="goToDashboard()"
            class="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors cursor-pointer"
            type="button">
            Retour sur l'application
          </button>
        } @else {
          <div class="mb-6">
            <span class="material-symbols-outlined text-red-600 text-6xl">
              error
            </span>
          </div>
          
          <h1 class="text-2xl font-bold text-gray-900 mb-2">
            Erreur
          </h1>
          
          <p class="text-gray-600 mb-6">
            Impossible de vérifier le paiement.
          </p>
          
          <button
            (click)="goToDashboard()"
            class="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors cursor-pointer"
            type="button">
            Retour sur l'application
          </button>
        }
      </div>
    </div>
  `,
  styles: []
})
export class RechargeSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paymentService = inject(PaymentService);
  
  isLoading = signal(true);
  sessionDetails = signal<any>(null);
  
  ngOnInit() {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    
    if (sessionId) {
      this.verifyPayment(sessionId);
    } else {
      this.isLoading.set(false);
    }
  }
  
  async verifyPayment(sessionId: string) {
    try {
      const details = await this.paymentService.verifySession(sessionId).toPromise();
      this.sessionDetails.set(details);
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
  
  goToDashboard() {
    this.router.navigate(['/utilisateurs']);
  }
}