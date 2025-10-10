import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  isMobileMenuOpen = signal(false);
  isExpertisesOpen = signal(false);
  isClientsOpen = signal(false);

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(value => !value);
    if (this.isMobileMenuOpen()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
    document.body.style.overflow = 'auto';
  }

  scrollToSection(sectionId: string) {
    this.closeMobileMenu(); // Ferme le menu mobile si ouvert
    
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 96; // Hauteur de votre header (h-24 = 96px)
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  toggleExpertises() {
    this.isExpertisesOpen.update(value => !value);
    this.isClientsOpen.set(false);
  }

  toggleClients() {
    this.isClientsOpen.update(value => !value);
    this.isExpertisesOpen.set(false);
  }

  closeMenus() {
    this.isExpertisesOpen.set(false);
    this.isClientsOpen.set(false);
  }
}