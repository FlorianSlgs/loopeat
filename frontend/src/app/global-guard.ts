import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './connection/common/services/core/auth/auth.service';
import { AuthStateService } from './connection/common/services/core/auth-state/auth-state.service';
import { map, catchError, of } from 'rxjs';

export const globalGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const authStateService = inject(AuthStateService);
  const router = inject(Router);

  console.log('🛡️ Guard activé pour:', state.url);

  // Vérifier l'authentification via l'API
  return authService.getCurrentUser().pipe(
    map(response => {
      if (response.success && response.user) {
        console.log('✅ Utilisateur authentifié:', response.user);

        // Mettre à jour le state local avec les infos de l'utilisateur
        authStateService.setUser(response.user);

        // Vérifier les permissions selon la route
        const isPro = response.user.isPro || false;

        // Routes protégées par type d'utilisateur
        if (state.url.startsWith('/pro') && !isPro) {
          console.warn('⚠️ Accès refusé: utilisateur non-pro essaie d\'accéder à /pro');
          router.navigate(['/utilisateurs']);
          return false;
        }

        if (state.url.startsWith('/utilisateurs') && isPro) {
          console.warn('⚠️ Accès refusé: utilisateur pro essaie d\'accéder à /utilisateurs');
          router.navigate(['/pro']);
          return false;
        }

        if (state.url.startsWith('/admin') && !response.user.admin) {
          console.warn('⚠️ Accès refusé: utilisateur non-admin essaie d\'accéder à /admin');
          router.navigate([isPro ? '/pro' : '/utilisateurs']);
          return false;
        }

        return true;
      }

      console.log('❌ Pas d\'utilisateur authentifié');
      router.navigate(['/connexion']);
      return false;
    }),
    catchError(error => {
      console.error('❌ Erreur lors de la vérification de l\'authentification:', error);
      router.navigate(['/connexion']);
      return of(false);
    })
  );
};
