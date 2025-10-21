import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

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
    this.closeMobileMenu();
    
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 96;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  navigateToLogin() {
    this.closeMobileMenu();
    this.router.navigate(['/connexion']);
  }

  navigateToPro() {
    this.closeMobileMenu();
    this.router.navigate(['/connexion-pro']);
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