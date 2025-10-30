// src/app/apps/pro/components/pro-give-back-validation/pro-give-back-validation.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProGiveBackService, BorrowedBoxGroup, ReturnItem } from '../../common/services/pro-give_back/pro-give-back.service';

interface BoxSelection {
  type: number;
  label: string;
  maxNumber: number;
  selectedNumber: number;
}

@Component({
  selector: 'app-pro-give-back-validation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pro-give-back-validation.html',
  styleUrl: './pro-give-back-validation.css'
})
export class ProGiveBackValidation implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly giveBackService = inject(ProGiveBackService);

  // Données
  userCode = signal('');
  userName = signal('');
  userEmail = signal('');
  borrowedBoxes = signal<BorrowedBoxGroup[]>([]);
  boxSelections = signal<BoxSelection[]>([]);
  
  // États
  isLoading = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal('');
  
  // Mapping des types vers les images
  private readonly boxTypeImages: Record<number, string> = {
    1: 'verre-salade.webp',
    2: 'plastique-salade.webp',
    3: 'frites.jpg',
    4: 'pizza.png',
    5: 'gobelet.jpg',
    6: 'burger.jpg'
  };

  ngOnInit() {
    // Récupérer le code utilisateur depuis les paramètres de requête
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      if (code) {
        this.userCode.set(code);
        this.loadUserBorrows(code);
      } else {
        this.errorMessage.set('Code utilisateur manquant');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Charger les boîtes empruntées par l'utilisateur
   */
  loadUserBorrows(code: string) {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.giveBackService.getUserBorrows(code).subscribe({
      next: (response) => {
        if (response.success) {
          this.userName.set(`${response.user.firstName} ${response.user.lastName}`);
          this.userEmail.set(response.user.email);
          this.borrowedBoxes.set(response.borrows);
          
          // Initialiser les sélections
          const selections: BoxSelection[] = response.borrows.map(box => ({
            type: box.type,
            label: box.label,
            maxNumber: box.totalNumber,
            selectedNumber: 0
          }));
          this.boxSelections.set(selections);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des boîtes:', error);
        this.errorMessage.set(error.error?.message || 'Erreur lors du chargement des boîtes empruntées');
        this.isLoading.set(false);
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
   * Incrémenter le nombre de boîtes sélectionnées
   */
  incrementSelection(selection: BoxSelection) {
    if (selection.selectedNumber < selection.maxNumber) {
      selection.selectedNumber++;
      this.updateSelections();
    }
  }

  /**
   * Décrémenter le nombre de boîtes sélectionnées
   */
  decrementSelection(selection: BoxSelection) {
    if (selection.selectedNumber > 0) {
      selection.selectedNumber--;
      this.updateSelections();
    }
  }

  /**
   * Mettre à jour l'input manuellement
   */
  onInputChange(selection: BoxSelection, value: string) {
    const num = parseInt(value) || 0;
    selection.selectedNumber = Math.min(Math.max(0, num), selection.maxNumber);
    this.updateSelections();
  }

  /**
   * Mettre à jour le signal des sélections
   */
  private updateSelections() {
    this.boxSelections.set([...this.boxSelections()]);
  }

  /**
   * Calculer le nombre total de boîtes sélectionnées
   */
  getTotalSelectedBoxes(): number {
    return this.boxSelections().reduce((sum, sel) => sum + sel.selectedNumber, 0);
  }

  /**
   * Vérifier si au moins une boîte est sélectionnée
   */
  hasSelection(): boolean {
    return this.getTotalSelectedBoxes() > 0;
  }

  /**
   * Valider le retour des boîtes
   */
  validateReturn() {
    if (!this.hasSelection()) {
      return;
    }

    // Préparer les items à retourner
    const items: ReturnItem[] = this.boxSelections()
      .filter(sel => sel.selectedNumber > 0)
      .map(sel => ({
        type: sel.type,
        number: sel.selectedNumber
      }));

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.giveBackService.recordGiveBack(this.userCode(), items).subscribe({
      next: (response) => {
        if (response.success) {
          // Retour au dashboard
          this.router.navigate(['/pro/dashboard']);
        }
        this.isSubmitting.set(false);
      },
      error: (error) => {
        console.error('Erreur lors de l\'enregistrement du retour:', error);
        this.errorMessage.set(error.error?.message || 'Erreur lors de l\'enregistrement du retour');
        this.isSubmitting.set(false);
      }
    });
  }

  /**
   * Annuler et retourner au dashboard
   */
  cancel() {
    this.router.navigate(['/pro/dashboard']);
  }
}