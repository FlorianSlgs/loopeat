import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './connection/common/services/core/auth/auth.service';
import { map, catchError, of } from 'rxjs';

/**
 * Guard qui redirige les utilisateurs déjà connectés vers leur espace approprié
 * Utilisé sur les pages de connexion pour éviter qu'un utilisateur connecté y accède
 */
export const connectionRedirectGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  console.log('🔒 Connection redirect guard activé pour:', state.url);

  return authService.getCurrentUser().pipe(
    map(response => {
      if (response.success && response.user) {
        console.log('✅ Utilisateur déjà connecté, redirection...');

        const isPro = response.user.isPro || false;
        const isAdmin = response.user.admin || false;

        // Rediriger selon le type d'utilisateur
        if (isAdmin) {
          console.log('➡️ Redirection vers /admin');
          router.navigate(['/admin']);
        } else if (isPro) {
          console.log('➡️ Redirection vers /pro');
          router.navigate(['/pro']);
        } else {
          console.log('➡️ Redirection vers /utilisateurs');
          router.navigate(['/utilisateurs']);
        }

        return false; // Bloque l'accès à la page de connexion
      }

      // Utilisateur non connecté, autorise l'accès à la page de connexion
      console.log('✅ Utilisateur non connecté, accès à la page de connexion autorisé');
      return true;
    }),
    catchError(error => {
      console.error('⚠️ Erreur lors de la vérification de l\'authentification:', error);
      // En cas d'erreur, on autorise l'accès à la page de connexion
      return of(true);
    })
  );
};
