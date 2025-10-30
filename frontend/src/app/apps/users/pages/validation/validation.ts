import { Component, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BorrowService } from '../../common/services/borrow/borrow.service';
import { BorrowWebsocketService } from '../../common/services/borrow-websocket/borrow-websocket.service';
import { UserProposalDetails, UserProposalStatus, BatchProposalsResponse } from '../../common/models/borrow.model';

@Component({
  selector: 'app-validation',
  imports: [CommonModule],
  templateUrl: './validation.html',
  styleUrl: './validation.css'
})
export class Validation implements OnInit, OnDestroy {
 
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly borrowService = inject(BorrowService);
  private readonly wsService = inject(BorrowWebsocketService);

  // Signaux
  readonly proposal = signal<UserProposalDetails | null>(null);
  readonly batchProposals = signal<BatchProposalsResponse | null>(null);
  readonly isBatch = signal(false);
  readonly status = signal<UserProposalStatus>(UserProposalStatus.PENDING);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly timeRemaining = signal(300000); // 5 minutes en ms

  // Timer
  private timerInterval: any = null;

  // Computed
  readonly minutes = computed(() => Math.floor(this.timeRemaining() / 60000));
  readonly seconds = computed(() => Math.floor((this.timeRemaining() % 60000) / 1000));
  readonly isExpired = computed(() => this.timeRemaining() <= 0);
  readonly canInteract = computed(() =>
    this.status() === UserProposalStatus.PENDING && !this.isExpired()
  );
  readonly totalBoxes = computed(() => {
    if (this.isBatch() && this.batchProposals()) {
      return this.batchProposals()!.proposals.reduce((sum, p) => sum + p.number, 0);
    }
    return this.proposal()?.number || 0;
  });

  constructor() {
    // Écouter les événements WebSocket
    effect(() => {
      const accepted = this.wsService.proposalAccepted();
      const currentId = this.isBatch() ? this.batchProposals()?.batchId : this.proposal()?.id;

      if (accepted === currentId) {
        this.status.set(UserProposalStatus.ACCEPTED);
        this.stopTimer();
      }
    });

    effect(() => {
      const rejected = this.wsService.proposalRejected();
      const currentId = this.isBatch() ? this.batchProposals()?.batchId : this.proposal()?.id;

      if (rejected?.proposalId === currentId) {
        this.status.set(UserProposalStatus.REJECTED);
        this.stopTimer();
      }
    });

    effect(() => {
      const expired = this.wsService.proposalExpired();
      const currentId = this.isBatch() ? this.batchProposals()?.batchId : this.proposal()?.id;

      if (expired === currentId) {
        this.status.set(UserProposalStatus.EXPIRED);
        this.stopTimer();
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const type = this.route.snapshot.queryParamMap.get('type'); // 'batch' ou null

    if (!id) {
      this.error.set('ID de proposition manquant');
      this.loading.set(false);
      return;
    }

    // Récupérer le token d'authentification
    const authToken = this.getAuthToken();
    if (authToken) {
      this.wsService.connect(authToken);
      this.wsService.joinProposal(id);
    }

    // Charger les détails selon le type
    if (type === 'batch') {
      this.isBatch.set(true);
      this.loadBatch(id);
    } else {
      this.loadProposal(id);
    }
  }

  ngOnDestroy(): void {
    const id = this.isBatch() ? this.batchProposals()?.batchId : this.proposal()?.id;
    if (id) {
      this.wsService.leaveProposal(id);
    }
    this.stopTimer();
  }

  private loadProposal(proposalId: string): void {
    this.borrowService.getProposal(proposalId).subscribe({
      next: (response) => {
        if (response.success && response.proposal) {
          this.proposal.set(response.proposal);
          this.timeRemaining.set(response.proposal.timeRemaining);

          // Déterminer le statut
          if (response.proposal.accepted === true) {
            this.status.set(UserProposalStatus.ACCEPTED);
          } else if (response.proposal.accepted === false) {
            this.status.set(UserProposalStatus.REJECTED);
          } else if (response.proposal.timeRemaining <= 0) {
            this.status.set(UserProposalStatus.EXPIRED);
          } else {
            this.status.set(UserProposalStatus.PENDING);
            this.startTimer();
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

  private loadBatch(batchId: string): void {
    this.borrowService.getBatchProposals(batchId).subscribe({
      next: (response: any) => {
        if (response.success && response.proposals) {
          this.batchProposals.set({
            success: response.success,
            batchId: response.batchId,
            proposals: response.proposals,
            user: response.user,
            pro: response.pro
          });

          // Utiliser le timeRemaining de la première proposition
          const firstProposal = response.proposals[0];
          this.timeRemaining.set(firstProposal.timeRemaining);

          // Déterminer le statut global du batch
          const allAccepted = response.proposals.every((p: any) => p.accepted === true);
          const anyRejected = response.proposals.some((p: any) => p.accepted === false);

          if (allAccepted) {
            this.status.set(UserProposalStatus.ACCEPTED);
          } else if (anyRejected) {
            this.status.set(UserProposalStatus.REJECTED);
          } else if (firstProposal.timeRemaining <= 0) {
            this.status.set(UserProposalStatus.EXPIRED);
          } else {
            this.status.set(UserProposalStatus.PENDING);
            this.startTimer();
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

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      const remaining = this.timeRemaining() - 1000;
      this.timeRemaining.set(Math.max(0, remaining));

      if (remaining <= 0) {
        this.status.set(UserProposalStatus.EXPIRED);
        this.stopTimer();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  acceptProposal(): void {
    if (!this.canInteract()) return;

    this.loading.set(true);

    if (this.isBatch()) {
      const batchId = this.batchProposals()?.batchId;
      if (!batchId) return;

      this.borrowService.acceptBatch(batchId).subscribe({
        next: (response) => {
          if (response.success) {
            this.status.set(UserProposalStatus.ACCEPTED);
            this.stopTimer();
          }
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Erreur lors de l\'acceptation du batch:', err);
          this.error.set('Erreur lors de l\'acceptation des propositions');
          this.loading.set(false);
        }
      });
    } else {
      const proposalId = this.proposal()?.id;
      if (!proposalId) return;

      this.borrowService.acceptProposal(proposalId).subscribe({
        next: (response) => {
          if (response.success) {
            this.status.set(UserProposalStatus.ACCEPTED);
            this.stopTimer();
          }
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Erreur lors de l\'acceptation:', err);
          this.error.set('Erreur lors de l\'acceptation de la proposition');
          this.loading.set(false);
        }
      });
    }
  }

  rejectProposal(): void {
    if (!this.canInteract()) return;

    this.loading.set(true);

    if (this.isBatch()) {
      const batchId = this.batchProposals()?.batchId;
      if (!batchId) return;

      this.borrowService.rejectBatch(batchId).subscribe({
        next: (response) => {
          if (response.success) {
            this.status.set(UserProposalStatus.REJECTED);
            this.stopTimer();
          }
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Erreur lors du refus du batch:', err);
          this.error.set('Erreur lors du refus des propositions');
          this.loading.set(false);
        }
      });
    } else {
      const proposalId = this.proposal()?.id;
      if (!proposalId) return;

      this.borrowService.rejectProposal(proposalId).subscribe({
        next: (response) => {
          if (response.success) {
            this.status.set(UserProposalStatus.REJECTED);
            this.stopTimer();
          }
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Erreur lors du refus:', err);
          this.error.set('Erreur lors du refus de la proposition');
          this.loading.set(false);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/utilisateurs/dashboard']);
  }

  private getAuthToken(): string | null {
    // Récupérer le token depuis le cookie ou le localStorage
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith('auth_token='));
    return authCookie ? authCookie.split('=')[1] : null;
  }

  getBoxTypeName(type: number): string {
    const types: { [key: number]: string } = {
      1: 'Boite Salade Verre',
      2: 'Boite Salade Plastique',
      3: 'Boite Frites',
      4: 'Boite Pizza',
      5: 'Gobelet',
      6: 'Boite Burger',
      
    };
    return types[type] || `Type ${type}`;
  }
}