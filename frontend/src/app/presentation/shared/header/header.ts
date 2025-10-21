import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../connection/common/services/core/auth/auth.service';
import { AuthStateService } from '../../../connection/common/services/core/auth-state/auth-state.service';

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

  private authService = inject(Auth);
  private authStateService = inject(AuthStateService);

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

    // Vérifier si l'utilisateur est déjà connecté
    this.authService.getCurrentUser().subscribe({
      next: (response) => {
        if (response.success && response.user) {
          // Utilisateur déjà connecté
          const isPro = response.user.isPro || false;
          const isAdmin = response.user.admin || false;

          if (!isPro && !isAdmin) {
            // Utilisateur standard, le rediriger vers son espace
            this.router.navigate(['/utilisateurs']);
          } else {
            // Utilisateur pro ou admin qui clique sur "Se connecter"
            // Le déconnecter et le rediriger vers la connexion utilisateur
            console.log('🔄 Déconnexion de l\'utilisateur pro/admin pour accéder à l\'espace utilisateur');
            this.authService.logout().subscribe({
              next: () => {
                console.log('✅ Déconnexion réussie, redirection vers /connexion');
                this.authStateService.clearState();
                this.router.navigate(['/connexion']);
              },
              error: (error) => {
                console.error('❌ Erreur lors de la déconnexion:', error);
                this.authStateService.clearState();
                // Même en cas d'erreur, rediriger vers la page de connexion
                this.router.navigate(['/connexion']);
              }
            });
          }
        } else {
          // Pas connecté, aller vers la page de connexion
          this.router.navigate(['/connexion']);
        }
      },
      error: () => {
        // En cas d'erreur, aller vers la page de connexion
        this.router.navigate(['/connexion']);
      }
    });
  }

  navigateToPro() {
    this.closeMobileMenu();

    // Vérifier si l'utilisateur est déjà connecté
    this.authService.getCurrentUser().subscribe({
      next: (response) => {
        if (response.success && response.user) {
          // Utilisateur déjà connecté
          const isPro = response.user.isPro || false;
          const isAdmin = response.user.admin || false;

          if (isAdmin || isPro) {
            // L'utilisateur est admin ou pro, le rediriger vers son espace
            this.router.navigate(isAdmin ? ['/admin'] : ['/pro']);
          } else {
            // Utilisateur standard qui clique sur "Espace Pro"
            // Le déconnecter et le rediriger vers la connexion pro
            console.log('🔄 Déconnexion de l\'utilisateur standard pour accéder à l\'espace pro');
            this.authService.logout().subscribe({
              next: () => {
                console.log('✅ Déconnexion réussie, redirection vers /connexion-pro');
                this.authStateService.clearState();
                this.router.navigate(['/connexion-pro']);
              },
              error: (error) => {
                console.error('❌ Erreur lors de la déconnexion:', error);
                this.authStateService.clearState();
                // Même en cas d'erreur, rediriger vers la page de connexion pro
                this.router.navigate(['/connexion-pro']);
              }
            });
          }
        } else {
          // Pas connecté, aller vers la page de connexion pro
          this.router.navigate(['/connexion-pro']);
        }
      },
      error: () => {
        // En cas d'erreur, aller vers la page de connexion pro
        this.router.navigate(['/connexion-pro']);
      }
    });
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