// boxes.ts
import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BorrowService } from '../../common/services/borrow/borrow.service';

interface BoxDisplay {
  type: number;
  totalNumber: number;
  image: string;
  label: string;
}

@Component({
  selector: 'app-boxes',
  imports: [CommonModule],
  templateUrl: './boxes.html',
  styleUrl: './boxes.css'
})
export class Boxes implements OnInit {
  private borrowService = inject(BorrowService);

  boxes = signal<BoxDisplay[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  // Mapping des types numériques (1-6) vers leurs images et labels
  private readonly boxTypeConfig: Record<number, { image: string; label: string }> = {
    1: { image: 'verre-salade.webp', label: 'Boîte Verre Salade' },
    2: { image: 'plastique-salade.webp', label: 'Boîte Plastique Salade' },
    3: { image: 'frites.jpg', label: 'Boîte Frite' },
    4: { image: 'pizza.png', label: 'Boîte Pizza' },
    5: { image: 'gobelet.jpg', label: 'Gobelet' },
    6: { image: 'burger.jpg', label: 'Boîte Burger' }
  };

  ngOnInit() {
    this.loadBorrowedBoxes();
  }

  loadBorrowedBoxes() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.borrowService.getActiveBorrows().subscribe({
      next: (response) => {
        if (response.success && response.borrows) {
          const boxMap = new Map<number, number>();

          response.borrows.forEach(borrow => {
            borrow.items.forEach(item => {
              // Convertir le type en nombre si c'est une string
              const typeNum = typeof item.type === 'string' ? parseInt(item.type) : item.type;
              const currentCount = boxMap.get(typeNum) || 0;
              boxMap.set(typeNum, currentCount + item.number);
            });
          });

          const allBoxes: BoxDisplay[] = Array.from(boxMap.entries()).map(([type, totalNumber]) => {
            const config = this.boxTypeConfig[type] || {
              image: 'default-box.png',
              label: `Boîte Type ${type}`
            };

            return {
              type,
              totalNumber,
              image: config.image,
              label: config.label
            };
          });

          // Trier par type numérique
          allBoxes.sort((a, b) => a.type - b.type);
          this.boxes.set(allBoxes);
        } else {
          this.boxes.set([]);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des boîtes:', error);
        this.errorMessage.set('Impossible de charger vos boîtes empruntées');
        this.isLoading.set(false);
      }
    });
  }

  getBoxText(box: BoxDisplay): string {
    if (box.totalNumber === 1) {
      return `1 ${box.label} empruntée`;
    }
    return `${box.totalNumber} ${box.label}s empruntées`;
  }
}