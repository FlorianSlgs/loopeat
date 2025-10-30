import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProBorrowService } from '../../common/services/pro-borrow/pro-borrow.service';
import { ProBorrowProposal } from '../../common/models/pro-borrow.model';

enum ProposalStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

@Component({
  selector: 'app-pro-validation',
  imports: [CommonModule],
  templateUrl: './pro-validation.html',
  styleUrl: './pro-validation.css'
})
export class ProValidation implements OnInit, OnDestroy {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly borrowService = inject(ProBorrowService);

  // Signaux
  readonly batchId = signal<string | null>(null);
  readonly proposals = signal<ProBorrowProposal[]>([]);
  readonly userInfo = signal<{firstName: string, lastName: string, email: string} | null>(null);
  readonly status = signal<ProposalStatus>(ProposalStatus.PENDING);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly timeRemaining = signal(300000); // 5 minutes en ms

  // Timers
  private timerInterval: any = null;
  private pollingInterval: any = null;

  // Computed
  readonly minutes = computed(() => Math.floor(this.timeRemaining() / 60000));
  readonly seconds = computed(() => Math.floor((this.timeRemaining() % 60000) / 1000));
  readonly isExpired = computed(() => this.timeRemaining() <= 0);
  readonly canCancel = computed(() =>
    this.status() === ProposalStatus.PENDING && !this.isExpired()
  );
  readonly totalBoxes = computed(() =>
    this.proposals().reduce((sum, p) => sum + p.number, 0)
  );

  ngOnInit(): void {
    const batchId = this.route.snapshot.paramMap.get('id');

    if (!batchId) {
      this.error.set('ID de batch manquant');
      this.loading.set(false);
      return;
    }

    this.batchId.set(batchId);
    // Charger toutes les propositions du batch
    this.loadBatchProposals(batchId);
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.stopPolling();
  }

  private loadBatchProposals(batchId: string): void {
    this.borrowService.getBatchProposals(batchId).subscribe({
      next: (response) => {
        if (response.success && response.proposals) {
          this.proposals.set(response.proposals);
          this.userInfo.set(response.user);

          // Utiliser le timeRemaining de la première proposition
          const firstProposal = response.proposals[0];
          if (firstProposal) {
            this.timeRemaining.set(firstProposal.timeRemaining);

            // Déterminer le statut (toutes les propositions du batch ont le même statut)
            if (firstProposal.accepted === true) {
              this.status.set(ProposalStatus.ACCEPTED);
              this.stopPolling();
            } else if (firstProposal.accepted === false) {
              this.status.set(ProposalStatus.REJECTED);
              this.stopPolling();
            } else if (firstProposal.timeRemaining <= 0) {
              this.status.set(ProposalStatus.EXPIRED);
              this.stopPolling();
            } else {
              this.status.set(ProposalStatus.PENDING);
              this.startTimer();
              this.startPolling(batchId);
            }
          }
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement du batch:', err);
        this.error.set('Impossible de charger les propositions');
        this.loading.set(false);
      }
    });
  }

  // Démarrer le polling (vérification toutes les 2 secondes)
  private startPolling(batchId: string): void {
    console.log('🔄 Démarrage du polling...');

    this.pollingInterval = setInterval(() => {
      this.checkBatchStatus(batchId);
    }, 2000); // Vérifier toutes les 2 secondes
  }

  // Arrêter le polling
  private stopPolling(): void {
    if (this.pollingInterval) {
      console.log('⏹️ Arrêt du polling');
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Vérifier le statut du batch
  private checkBatchStatus(batchId: string): void {
    // Ne pas afficher le loading pendant le polling pour éviter le clignotement
    this.borrowService.getBatchProposals(batchId).subscribe({
      next: (response) => {
        if (response.success && response.proposals && response.proposals.length > 0) {
          const firstProposal = response.proposals[0];

          // Mettre à jour le temps restant
          this.timeRemaining.set(firstProposal.timeRemaining);

          // Vérifier si le statut a changé
          if (firstProposal.accepted === true && this.status() !== ProposalStatus.ACCEPTED) {
            console.log('✅ Propositions acceptées !');
            this.status.set(ProposalStatus.ACCEPTED);
            this.proposals.set(response.proposals);
            this.stopTimer();
            this.stopPolling();
          } else if (firstProposal.accepted === false && this.status() !== ProposalStatus.REJECTED) {
            console.log('❌ Propositions rejetées');
            this.status.set(ProposalStatus.REJECTED);
            this.proposals.set(response.proposals);
            this.stopTimer();
            this.stopPolling();
          } else if (firstProposal.timeRemaining <= 0 && this.status() !== ProposalStatus.EXPIRED) {
            console.log('⏰ Propositions expirées');
            this.status.set(ProposalStatus.EXPIRED);
            this.proposals.set(response.proposals);
            this.stopTimer();
            this.stopPolling();
          }
        }
      },
      error: (err) => {
        console.error('Erreur lors de la vérification du statut:', err);
        // Ne pas afficher l'erreur à l'utilisateur, juste loguer
        // On réessaiera dans 2 secondes
      }
    });
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      const remaining = this.timeRemaining() - 1000;
      this.timeRemaining.set(Math.max(0, remaining));

      if (remaining <= 0) {
        this.status.set(ProposalStatus.EXPIRED);
        this.stopTimer();
        this.stopPolling();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  cancelProposal(): void {
    const proposals = this.proposals();
    if (proposals.length === 0 || !this.canCancel()) return;

    this.loading.set(true);

    // Annuler la première proposition (ce qui devrait annuler tout le batch)
    const firstProposalId = proposals[0].id;

    this.borrowService.cancelProposal(firstProposalId).subscribe({
      next: (response) => {
        if (response.success) {
          this.status.set(ProposalStatus.REJECTED);
          this.stopTimer();
          this.stopPolling();
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors de l\'annulation:', err);
        this.error.set('Erreur lors de l\'annulation de la proposition');
        this.loading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/pro/dashboard']);
  }

  getBoxTypeName(type: number): string {
    const types: { [key: number]: string } = {
      1: 'Boite Salade Verre',
      2: 'Boite Salade Plastique',
      3: 'Boite Frites',
      4: 'Boite Pizza',
      5: 'Gobelet',
      6: 'Boite Burger'
    };
    return types[type] || `Type ${type}`;
  }
}