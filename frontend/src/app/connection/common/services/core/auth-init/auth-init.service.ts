import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Auth } from '../auth/auth.service';
import { AuthStateService } from '../auth-state/auth-state.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthInitService {
  private readonly authService = inject(Auth);
  private readonly authStateService = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private initialized = false;

  /**
   * Initialise l'état d'authentification au démarrage de l'application
   * Vérifie si l'utilisateur a un token auth_token valide
   */
  async initializeAuth(): Promise<void> {
    // Ne s'exécute que côté browser
    if (!isPlatformBrowser(this.platformId)) {
      console.log('⚠️ AuthInit: SSR détecté, skip de l\'initialisation');
      return;
    }

    // Éviter les initialisations multiples
    if (this.initialized) {
      console.log('⚠️ AuthInit: Déjà initialisé');
      return;
    }

    this.initialized = true;

    console.log('🚀 AuthInit: Vérification de l\'authentification au démarrage...');

    try {
      const response = await this.authService.getCurrentUser().toPromise();

      if (response && response.success && response.user) {
        console.log('✅ AuthInit: Utilisateur authentifié détecté:', response.user.email);

        // Restaurer l'état de l'utilisateur
        this.authStateService.setUser(response.user);

        console.log('✅ AuthInit: État d\'authentification restauré');
      } else {
        console.log('ℹ️ AuthInit: Pas d\'utilisateur authentifié');
      }
    } catch (error) {
      console.log('ℹ️ AuthInit: Pas d\'authentification active (normal si pas connecté)');
      // Ne pas logger l'erreur comme critique, c'est normal si l'utilisateur n'est pas connecté
    }
  }

  /**
   * Nettoie l'état d'authentification et déconnecte l'utilisateur
   */
  async logout(): Promise<void> {
    console.log('🔓 AuthInit: Déconnexion...');

    try {
      await this.authService.logout().toPromise();
      this.authStateService.clearState();

      console.log('✅ AuthInit: Déconnexion réussie');

      // Rediriger vers la page de connexion
      this.router.navigate(['/connexion']);
    } catch (error) {
      console.error('❌ AuthInit: Erreur lors de la déconnexion:', error);
      // Nettoyer le state même en cas d'erreur
      this.authStateService.clearState();
      this.router.navigate(['/connexion']);
    }
  }

  /**
   * Vérifie si l'utilisateur est actuellement authentifié
   */
  isAuthenticated(): boolean {
    const user = this.authStateService.getCurrentUser();
    return user() !== null;
  }

  /**
   * Récupère l'utilisateur actuel depuis le state
   */
  getCurrentUser() {
    return this.authStateService.getCurrentUser();
  }
}
