import { Component, OnInit, AfterViewInit, signal, computed, PLATFORM_ID, inject, ElementRef, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Restaurant {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  site?: string;
  contact?: string;
  image?: string;
  description?: string;
  type: 'restaurant' | 'foodtruck';
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './map.html',
  styleUrl: './map.css'
})
export class MapComponent implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private map?: any;
  private markers: any[] = [];
  private L?: any;

  // Référence directe au conteneur de la carte
  mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer');
  
  searchTerm = signal('');
  selectedRestaurant = signal<Restaurant | null>(null);
  showDetails = signal(false);
  tooltipPosition = signal({ top: 0, left: 0 });
  
  restaurants = signal<Restaurant[]>([
  {
    id: 1,
    name: 'La Gazette Café',
    address: '6 rue Levat, 34000 Montpellier',
    lat: 43.6104,
    lng: 3.8795,
    site: 'https://gazettecafe.com',           // ✅ Corrigé
    contact: '04 67 59 07 59',                 // ✅ Corrigé
    image: 'gazette.avif',
    description: 'Cuisine maison avec produits locaux et bio',
    type: 'restaurant'
  },
  {
    id: 2,
    name: 'Green Lab',
    address: '14 Rue de l\'Université, 34000 Montpellier',
    lat: 43.6106,
    lng: 3.8767,
    site: 'https://green-lab-universite.eatbu.com',  // ✅ Corrigé avec https://
    contact: '04 67 92 00 36',                       // ✅ Corrigé
    image: 'greenlab.jpeg',
    description: 'Restaurant 100% végétal',
    type: 'restaurant'
  },
  {
    id: 3,
    name: 'Les Cinq Saveurs d\'Ananda',
    address: '8 Rue du Faubourg de la Saunerie, 34000 Montpellier',
    lat: 43.6099,
    lng: 3.8722,
    site: 'https://instagram.com/saveursdana',  // ✅ Corrigé avec https://
    contact: '04 67 02 88 18',                  // ✅ Corrigé
    image: 'ananda.jpg',
    description: 'Cuisine végétarienne créative',
    type: 'foodtruck'
  }
]);

  filteredRestaurants = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.restaurants();
    
    return this.restaurants().filter(restaurant =>
      restaurant.name.toLowerCase().includes(term) ||
      restaurant.address.toLowerCase().includes(term)
    );
  });

  async ngOnInit() {
    // Import Leaflet uniquement côté client
    if (isPlatformBrowser(this.platformId)) {
      this.L = await import('leaflet');
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId) && this.L) {
      // Initialiser la carte après que la vue soit complètement chargée
      setTimeout(() => {
        this.initMap();
        this.addMarkers();
      }, 100); // Délai légèrement plus long pour l'hydratation SSR

      // Fermer le tooltip lors d'un clic en dehors
      document.addEventListener('click', (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.custom-tooltip') && !target.closest('.leaflet-marker-icon')) {
          this.closeDetails();
        }
      });
    }
  }

  private initMap(): void {
    if (!this.L || !this.mapContainer()) return;

    const mapElement = this.mapContainer()!.nativeElement;

    // S'assurer que l'élément existe et n'a pas déjà une carte
    if (!mapElement || mapElement.classList.contains('leaflet-container')) {
      return;
    }

    this.map = this.L.map(mapElement, {
      center: [43.6108, 3.8767],
      zoom: 11
    });

    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Fermer le tooltip lors du déplacement de la carte
    this.map.on('movestart', () => {
      this.closeDetails();
    });
  }

  private createCustomIcon(type: 'restaurant' | 'foodtruck'): any {
    if (!this.L) return;

    const iconSvg = type === 'restaurant' 
      ? this.getRestaurantIconSvg()
      : this.getFoodtruckIconSvg();

    return this.L.divIcon({
      html: iconSvg,
      className: 'custom-marker-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -45]
    });
  }

  private getRestaurantIconSvg(): string {
    return `
      <div class="marker-pin restaurant w-8 h-8">
        <svg id="Calque_1" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 618.5 828.9">
          <!-- Generator: Adobe Illustrator 29.3.1, SVG Export Plug-In . SVG Version: 2.1.0 Build 151)  -->
          <defs>
            <style>
              .st0 {
                fill: #fff;
              }

              .st1 {
                fill: #047857;
              }
            </style>
          </defs>
          <path class="st1" d="M536.8,535.3c-56.7,83.9-227.4,293.6-227.4,293.6,0,0-170.7-209.7-227.4-293.6C-29.8,370.1-14.6,207.3,100.7,92S233.9,5.5,309.4,5.5s151.1,28.8,208.7,86.5c115.3,115.3,130.4,278.1,18.7,443.3h0Z"/>
          <path class="st0" d="M462.7,476c10.2,10.2,10.8,26.1,1.5,35.4s-25.3,8.6-35.4-1.5l-104.6-114.8c-7.2,0-15.2-1.7-24.2-5.4l38.2-38.2,24.9,24.9,99.6,99.6ZM242.6,350l47-47-47.6-47.7-98.2-98.2c-3.2-3.2-7.2-4.7-11.7-4.1-3.2.4-7.8,3.4-8.6,11.2-3.3,31.9,20.1,87.4,103.3,170.6,5.5,5.5,10.7,10.5,15.8,15.1h0ZM330,218.9l6.1-6.1h0c0,0-6.2,6.1-6.2,6.1h.1ZM505.9,208.3c-5.3-5.3-12.6-6.6-16.3-2.9l-74.5,74.5c-3.7,3.7-10.6,2.8-15.4-1.9-4.8-4.8-5.6-11.7-1.9-15.4l74.5-74.5c3.7-3.7,2.4-11.1-2.9-16.3-5.3-5.3-12.6-6.6-16.3-2.9l-74.6,74.5c-3.7,3.7-10.6,2.8-15.4-1.9-4.8-4.8-5.6-11.7-1.9-15.4l74.6-74.5c3.7-3.7,2.4-11.1-2.9-16.3-5.3-5.3-12.6-6.6-16.3-2.9l-80.5,80.5c-26.2,26.3-17.8,44.6-2.9,61.2l-207.1,207.1c-10.2,10.2-10.9,26.1-1.5,35.4,9.3,9.3,25.3,8.6,35.4-1.5l207.1-207.1c16.6,15,34.9,23.4,61.3-3l80.4-80.4c3.7-3.7,2.4-11-2.9-16.3h0Z"/>
        </svg>
      </div>
    `;
  }

  private getFoodtruckIconSvg(): string {
    return `
      <div class="marker-pin foodtruck w-8 h-8">
        <svg id="Calque_1" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 607.3 824.4">
          <!-- Generator: Adobe Illustrator 29.3.1, SVG Export Plug-In . SVG Version: 2.1.0 Build 151)  -->
          <defs>
            <style>
              .st0 {
                fill: #fff;
              }

              .st1 {
                fill: #047857;
              }
            </style>
          </defs>
          <path class="st1" d="M531.1,529.8c-56.7,83.9-227.4,293.6-227.4,293.6,0,0-170.7-209.7-227.4-293.6C-35.5,364.6-20.3,201.8,95,86.5S228.2,0,303.7,0s151.1,28.8,208.7,86.5c115.3,115.3,130.4,278.1,18.7,443.3h0Z"/>
          <path class="st0" d="M479.9,125.3H212.1c-3.8,0-8.3,2.8-9.9,6.3l-49.1,132.9c-1.6,3.5-5.7,7.8-9.1,9.5l-34.6,18.1c-3.4,1.8-6.2,6.4-6.2,10.2v96.2c0,3.8,3.1,7,6.9,7h369.6c3.8,0,6.9-3.1,6.9-7V132.2c0-3.8-3.1-6.9-6.9-6.9h.2Z"/>
          <path class="st0" d="M257.3,405.4c0,27.7-22.5,50.1-50.2,50.1s-50.1-22.4-50.1-50.1,22.5-50.1,50.1-50.1,50.2,22.4,50.2,50.1Z"/>
          <path class="st1" d="M233.4,405.4c0,14.5-11.7,26.2-26.2,26.2s-26.2-11.7-26.2-26.2,11.7-26.2,26.2-26.2,26.2,11.7,26.2,26.2h0Z"/>
          <circle class="st0" cx="391.4" cy="405.4" r="50.2"/>
          <path class="st1" d="M417.5,405.4c0,14.5-11.7,26.2-26.2,26.2s-26.2-11.7-26.2-26.2,11.7-26.2,26.2-26.2,26.2,11.7,26.2,26.2h0Z"/>
          <polygon class="st1" points="174.4 264.7 215 153.7 233.4 153.7 233.4 264.7 174.4 264.7"/>
          <rect class="st1" x="257.3" y="153.7" width="205.2" height="111.1"/>
          <path class="st0" d="M307.7,166.3h-38.6v29.2h0v.5c0,10.1,8.6,18.2,19.2,18.2s19.2-8.2,19.2-18.2,0-.3,0-.5h.2v-29.2h0Z"/>
          <path class="st0" d="M355.4,166.3h-38.6v29.2h0v.5c0,10.1,8.6,18.2,19.2,18.2s19.2-8.2,19.2-18.2,0-.3,0-.5h.2v-29.2h0Z"/>
          <path class="st0" d="M403,166.3h-38.6v29.2h0v.5c0,10.1,8.6,18.2,19.2,18.2s19.2-8.2,19.2-18.2,0-.3,0-.5h.2v-29.2h0Z"/>
          <path class="st0" d="M450.7,166.3h-38.6v29.2h0v.5c0,10.1,8.6,18.2,19.2,18.2s19.2-8.2,19.2-18.2,0-.3,0-.5h.2v-29.2h0Z"/>
        </svg>
      </div>
    `;
  }

  private addMarkers(): void {
    if (!this.L || !this.map) return;

    this.clearMarkers();

    this.filteredRestaurants().forEach(restaurant => {
      const customIcon = this.createCustomIcon(restaurant.type);
      
      const marker = this.L!.marker([restaurant.lat, restaurant.lng], { icon: customIcon })
        .addTo(this.map)
        .on('click', (e: any) => {
          this.showRestaurantDetails(restaurant, e);
        });

      this.markers.push(marker);
    });
  }

  private clearMarkers(): void {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }

  showRestaurantDetails(restaurant: Restaurant, event?: any): void {
    this.selectedRestaurant.set(restaurant);
    
    if (event && this.map) {
      // Calculer la position du tooltip par rapport au marker
      const point = this.map.latLngToContainerPoint([restaurant.lat, restaurant.lng]);
      this.tooltipPosition.set({
        top: point.y - 50, // 50px au-dessus du marker
        left: point.x
      });
    }
    
    this.showDetails.set(true);
  }

  closeDetails(): void {
    this.showDetails.set(false);
    setTimeout(() => {
      this.selectedRestaurant.set(null);
    }, 200);
  }

  getDirectionsUrl(restaurant: Restaurant): string {
    // Utilise Google Maps pour l'itinéraire
    return `https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lng}`;
  }

  onSearch(): void {
    this.closeDetails();
    this.addMarkers();
  }

  getPhoneUrl(phone: string): string {
    return `tel:${phone.replace(/\s/g, '')}`;
  }

  centerOnRestaurant(restaurant: Restaurant): void {
    if (!this.map) return;
    this.map.setView([restaurant.lat, restaurant.lng], 14);
    
    // Attendre que la carte soit centrée avant d'afficher le tooltip
    setTimeout(() => {
      const point = this.map.latLngToContainerPoint([restaurant.lat, restaurant.lng]);
      this.tooltipPosition.set({
        top: point.y - 50,
        left: point.x
      });
      this.showRestaurantDetails(restaurant);
    }, 300);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.closeDetails();
    this.addMarkers();
  }
}