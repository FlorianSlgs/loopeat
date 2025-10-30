import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProBorrowService } from '../../common/services/pro-borrow/pro-borrow.service';

interface BoxType {
  id: number;
  name: string;
  image: string;
  quantity: number;
}

@Component({
  selector: 'app-pro-selection',
  imports: [CommonModule],
  templateUrl: './pro-selection.html',
  styleUrl: './pro-selection.css'
})
export class ProSelection  implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly borrowService = inject(ProBorrowService);

  // Code client passé en paramètre
  readonly customerCode = signal<string>('');
  
  // Types de boîtes disponibles
  readonly boxTypes = signal<BoxType[]>([
    { id: 1, name: 'Boite Salade Verre', image: 'verre-salade.webp', quantity: 0 },
    { id: 2, name: 'Boite Salade Plastique', image: 'plastique-salade.webp', quantity: 0 },
    { id: 3, name: 'Boite Frites', image: 'frites.jpg', quantity: 0 },
    { id: 4, name: 'Boite Pizza', image: 'pizza.png', quantity: 0 },
    { id: 5, name: 'Gobelet', image: 'gobelet.jpg', quantity: 0 },
    { id: 6, name: 'Boite Burger', image: 'burger.jpg', quantity: 0 }
  ]);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // Computed: Total de boîtes sélectionnées
  readonly totalBoxes = computed(() => 
    this.boxTypes().reduce((sum, box) => sum + box.quantity, 0)
  );

  // Computed: Au moins une boîte sélectionnée
  readonly hasSelection = computed(() => this.totalBoxes() > 0);

  ngOnInit(): void {
    // Récupérer le code client depuis les paramètres de route
    const code = this.route.snapshot.queryParamMap.get('code');
    if (code) {
      this.customerCode.set(code);
    } else {
      this.error.set('Code client manquant');
    }
  }

  /**
   * Incrémenter la quantité d'un type de boîte
   */
  increment(boxId: number): void {
    const boxes = this.boxTypes();
    const box = boxes.find(b => b.id === boxId);
    if (box) {
      box.quantity++;
      this.boxTypes.set([...boxes]);
    }
  }

  /**
   * Décrémenter la quantité d'un type de boîte
   */
  decrement(boxId: number): void {
    const boxes = this.boxTypes();
    const box = boxes.find(b => b.id === boxId);
    if (box && box.quantity > 0) {
      box.quantity--;
      this.boxTypes.set([...boxes]);
    }
  }

  /**
   * Annuler et retourner au dashboard
   */
  cancel(): void {
    this.router.navigate(['/pro/dashboard']);
  }

  /**
   * Soumettre la proposition d'emprunt
   */
  submit(): void {
    if (!this.hasSelection()) {
      return;
    }

    if (!this.customerCode()) {
      this.error.set('Code client manquant');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // Préparer les items (seulement ceux avec quantity > 0)
    const items = this.boxTypes()
      .filter(box => box.quantity > 0)
      .map(box => ({
        type: box.id,
        number: box.quantity
      }));

    // Envoyer la requête au backend
    this.borrowService.createProposal({
      userCode: this.customerCode(),
      items: items
    }).subscribe({
      next: (response) => {
        if (response.success && response.batchId) {
          // Rediriger vers la page de validation avec le batch_id
          this.router.navigate(['/pro/borrow/validation', response.batchId]);
        } else {
          this.error.set('Erreur lors de la création de la proposition');
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('Erreur lors de la création de la proposition:', err);
        this.error.set(err.error?.message || 'Erreur lors de la création de la proposition');
        this.loading.set(false);
      }
    });
  }

}