import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProBorrowService } from '../../common/services/pro-borrow/pro-borrow.service';
import { ProProposalDetails } from '../../common/models/pro-borrow.model';

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
  readonly proposal = signal<ProProposalDetails | null>(null);
  readonly status = signal<ProposalStatus>(ProposalStatus.PENDING);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly timeRemaining = signal(300000); // 5 minutes en ms

  // Timers
  private timerInterval: any = null;
  private pollingInterval: any = null; // 🆕 Polling

  // Computed
  readonly minutes = computed(() => Math.floor(this.timeRemaining() / 60000));
  readonly seconds = computed(() => Math.floor((this.timeRemaining() % 60000) / 1000));
  readonly isExpired = computed(() => this.timeRemaining() <= 0);
  readonly canCancel = computed(() => 
    this.status() === ProposalStatus.PENDING && !this.isExpired()
  );

  ngOnInit(): void {
    const proposalId = this.route.snapshot.paramMap.get('id');
    
    if (!proposalId) {
      this.error.set('ID de proposition manquant');
      this.loading.set(false);
      return;
    }

    // Charger les détails de la proposition
    this.loadProposal(proposalId);
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.stopPolling(); // 🆕 Arrêter le polling
  }

  private loadProposal(proposalId: string): void {
    this.borrowService.getProposal(proposalId).subscribe({
      next: (response) => {
        if (response.success && response.proposal) {
          this.proposal.set(response.proposal);
          this.timeRemaining.set(response.proposal.timeRemaining);
          
          // Déterminer le statut
          if (response.proposal.accepted === true) {
            this.status.set(ProposalStatus.ACCEPTED);
            this.stopPolling(); // Arrêter le polling si accepté
          } else if (response.proposal.accepted === false) {
            this.status.set(ProposalStatus.REJECTED);
            this.stopPolling(); // Arrêter le polling si rejeté
          } else if (response.proposal.timeRemaining <= 0) {
            this.status.set(ProposalStatus.EXPIRED);
            this.stopPolling(); // Arrêter le polling si expiré
          } else {
            this.status.set(ProposalStatus.PENDING);
            this.startTimer();
            this.startPolling(proposalId); // 🆕 Démarrer le polling
          }
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la proposition:', err);
        this.error.set('Impossible de charger la proposition');
        this.loading.set(false);
      }
    });
  }

  // 🆕 Démarrer le polling (vérification toutes les 2 secondes)
  private startPolling(proposalId: string): void {
    console.log('🔄 Démarrage du polling...');
    
    this.pollingInterval = setInterval(() => {
      this.checkProposalStatus(proposalId);
    }, 2000); // Vérifier toutes les 2 secondes
  }

  // 🆕 Arrêter le polling
  private stopPolling(): void {
    if (this.pollingInterval) {
      console.log('⏹️ Arrêt du polling');
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // 🆕 Vérifier le statut de la proposition
  private checkProposalStatus(proposalId: string): void {
    // Ne pas afficher le loading pendant le polling pour éviter le clignotement
    this.borrowService.getProposal(proposalId).subscribe({
      next: (response) => {
        if (response.success && response.proposal) {
          const proposal = response.proposal;
          
          // Mettre à jour le temps restant
          this.timeRemaining.set(proposal.timeRemaining);
          
          // Vérifier si le statut a changé
          if (proposal.accepted === true && this.status() !== ProposalStatus.ACCEPTED) {
            console.log('✅ Proposition acceptée !');
            this.status.set(ProposalStatus.ACCEPTED);
            this.proposal.set(proposal);
            this.stopTimer();
            this.stopPolling();
          } else if (proposal.accepted === false && this.status() !== ProposalStatus.REJECTED) {
            console.log('❌ Proposition rejetée');
            this.status.set(ProposalStatus.REJECTED);
            this.proposal.set(proposal);
            this.stopTimer();
            this.stopPolling();
          } else if (proposal.timeRemaining <= 0 && this.status() !== ProposalStatus.EXPIRED) {
            console.log('⏰ Proposition expirée');
            this.status.set(ProposalStatus.EXPIRED);
            this.proposal.set(proposal);
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
        this.stopPolling(); // Arrêter le polling
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
    const proposalId = this.proposal()?.id;
    if (!proposalId || !this.canCancel()) return;

    if (!confirm('Êtes-vous sûr de vouloir annuler cette proposition ?')) {
      return;
    }

    this.loading.set(true);

    this.borrowService.cancelProposal(proposalId).subscribe({
      next: (response) => {
        if (response.success) {
          this.status.set(ProposalStatus.REJECTED);
          this.stopTimer();
          this.stopPolling(); // Arrêter le polling
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
      1: 'Petite boîte',
      2: 'Moyenne boîte',
      3: 'Grande boîte'
    };
    return types[type] || `Type ${type}`;
  }
}