import { Component, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BorrowService } from '../../common/services/borrow/borrow.service';
import { BorrowWebsocketService } from '../../common/services/borrow-websocket/borrow-websocket.service';
import { UserProposalDetails, UserProposalStatus } from '../../common/models/borrow.model';

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

  constructor() {
    // Écouter les événements WebSocket
    effect(() => {
      const accepted = this.wsService.proposalAccepted();
      if (accepted === this.proposal()?.id) {
        this.status.set(UserProposalStatus.ACCEPTED);
        this.stopTimer();
      }
    });

    effect(() => {
      const rejected = this.wsService.proposalRejected();
      if (rejected?.proposalId === this.proposal()?.id) {
        this.status.set(UserProposalStatus.REJECTED);
        this.stopTimer();
      }
    });

    effect(() => {
      const expired = this.wsService.proposalExpired();
      if (expired === this.proposal()?.id) {
        this.status.set(UserProposalStatus.EXPIRED);
        this.stopTimer();
      }
    });
  }

  ngOnInit(): void {
    const proposalId = this.route.snapshot.paramMap.get('id');
    
    if (!proposalId) {
      this.error.set('ID de proposition manquant');
      this.loading.set(false);
      return;
    }

    // Récupérer le token d'authentification
    const authToken = this.getAuthToken();
    if (authToken) {
      this.wsService.connect(authToken);
      this.wsService.joinProposal(proposalId);
    }

    // Charger les détails de la proposition
    this.loadProposal(proposalId);
  }

  ngOnDestroy(): void {
    const proposalId = this.proposal()?.id;
    if (proposalId) {
      this.wsService.leaveProposal(proposalId);
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
    const proposalId = this.proposal()?.id;
    if (!proposalId || !this.canInteract()) return;

    this.loading.set(true);

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

  rejectProposal(): void {
    const proposalId = this.proposal()?.id;
    if (!proposalId || !this.canInteract()) return;

    this.loading.set(true);

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