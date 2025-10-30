// src/app/apps/users/pages/users-home/users-home.ts
import { Component, inject, OnInit, OnDestroy, effect } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { BorrowWebsocketService } from '../../common/services/borrow-websocket/borrow-websocket.service';
import { AuthService } from '../../common/services/auth/auth.service';

@Component({
  selector: 'app-users-home',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './users-home.html',
  styleUrl: './users-home.css'
})
export class UsersHome implements OnInit, OnDestroy {
  private router = inject(Router);
  private wsService = inject(BorrowWebsocketService);
  private authService = inject(AuthService);

  constructor() {
    // Écouter les nouvelles propositions via WebSocket
    effect(() => {
      const newProposal = this.wsService.proposalCreated();
      if (newProposal) {
        console.log('📦 [USERS-HOME] Nouvelle proposition reçue:', newProposal);

        // Vérifier si c'est un batch ou une proposition unique
        if (newProposal.isBatch && newProposal.batchId) {
          console.log(`🔀 [USERS-HOME] Redirection vers validation batch: ${newProposal.batchId} (${newProposal.proposalIds?.length} propositions)`);
          this.router.navigate(['/utilisateurs/borrow/validation', newProposal.batchId], {
            queryParams: { type: 'batch' }
          });
        } else if (newProposal.proposalId) {
          console.log('🔀 [USERS-HOME] Redirection vers validation unique:', newProposal.proposalId);
          this.router.navigate(['/utilisateurs/borrow/validation', newProposal.proposalId]);
        } else {
          console.error('❌ [USERS-HOME] ID de proposition manquant:', newProposal);
        }
      }
    });
  }

  ngOnInit(): void {
    console.log('🚀 [USERS-HOME] Initialisation du composant');
    
    // Récupérer un token WebSocket via l'endpoint sécurisé
    // Le cookie httpOnly sera automatiquement envoyé
    this.authService.getWebSocketToken().subscribe({
      next: (response) => {
        if (response.success && response.wsToken) {
          console.log('✅ [USERS-HOME] Token WebSocket obtenu');
          this.wsService.connect(response.wsToken);
        } else {
          console.error('❌ [USERS-HOME] Pas de token WebSocket dans la réponse');
        }
      },
      error: (err) => {
        console.error('❌ [USERS-HOME] Erreur récupération token WebSocket:', err);
        console.log('💡 [USERS-HOME] L\'utilisateur doit être connecté pour recevoir des propositions');
      }
    });
  }

  ngOnDestroy(): void {
    console.log('🔌 [USERS-HOME] Déconnexion du WebSocket');
    this.wsService.disconnect();
  }

  onSettingsClick() {
    if (this.router.url.includes('/utilisateurs/parametres')) {
      this.router.navigate(['/utilisateurs/dashboard']);
    } else {
      this.router.navigate(['/utilisateurs/parametres']);
    }
  }

  isOnSettingsPage(): boolean {
    return this.router.url.includes('/utilisateurs/parametres');
  }
}