import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';

interface CarouselSlide {
  id: number;
  title: string;
  subtitle: string;
  backgroundImage: string;
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [],
  templateUrl: './carousel.html',
  styleUrl: './carousel.css'
})
export class Carousel implements OnInit, OnDestroy {
  currentSlide = 0;
  intervalId: any;
  isTransitioning = false;
  autoPlayDuration = 10000; // 10 secondes par slide

    constructor(private cdr: ChangeDetectorRef) {}

  slides: CarouselSlide[] = [
    {
      id: 0,
      title: 'Un repas, zéro déchet',
      subtitle: "Avec loopeat, vos repas à emporter n’ont plus besoin d’emballages jetables. Empruntez une boîte réutilisable chez nos commerçants partenaires, dégustez tranquillement votre plat et rapportez-la quand vous le souhaitez.",
      backgroundImage: 'slide1.jpg'
    },
    {
      id: 1,
      title: 'La consigne qui fait la différence',
      subtitle: 'Chaque boîte loop eat est lavée et réutilisée. Résultat : moins de plastique à usage unique et un vrai geste pour l’environnement, sans changer vos habitudes.',
      backgroundImage: 'slide2.webp'
    },
    {
      id: 2,
      title: 'Rejoignez la communauté loop eat',
      subtitle: 'Choisir loop eat, c’est soutenir vos commerçants et dire oui à une consommation plus durable. Ensemble, faisons de l’emballage jetable un souvenir du passé !',
      backgroundImage: 'slide3.png'
    }
  ];

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  startAutoPlay() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
      this.cdr.detectChanges();
    }, this.autoPlayDuration);
  }

  stopAutoPlay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextSlide() {
    if (!this.isTransitioning) {
      this.isTransitioning = true;
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
      setTimeout(() => {
        this.isTransitioning = false;
      }, 500);
    }
  }

  previousSlide() {
    if (!this.isTransitioning) {
      this.isTransitioning = true;
      this.currentSlide = this.currentSlide === 0 
        ? this.slides.length - 1 
        : this.currentSlide - 1;
      setTimeout(() => {
        this.isTransitioning = false;
      }, 500);
    }
  }

  goToSlide(index: number) {
    if (!this.isTransitioning && index !== this.currentSlide) {
      this.isTransitioning = true;
      this.currentSlide = index;
      this.stopAutoPlay();
      this.startAutoPlay(); // Redémarre l'autoplay
      setTimeout(() => {
        this.isTransitioning = false;
      }, 500);
    }
  }

  getProgressPercentage(): number {
    return ((this.currentSlide + 1) / this.slides.length) * 100;
  }
}