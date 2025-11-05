import { Routes } from '@angular/router';
import { Accueil } from './presentation/pages/accueil/accueil';
import { globalGuard } from './global-guard';
import { connectionRedirectGuard } from './connection-redirect.guard';

export const routes: Routes = [
  { path: '', component: Accueil },

  {
    path: 'utilisateurs',
    canActivate: [globalGuard],
    loadChildren: () => import('./apps/users/users.routes').then(m => m.USERS_ROUTES)
  },

  {
    path: 'pro',
    canActivate: [globalGuard],
    loadChildren: () => import('./apps/pro/pro.routes').then(m => m.PRO_ROUTES)
  },

  {
    path: 'admin',
    canActivate: [globalGuard],
    loadComponent: () => import('./apps/admin/test2/test2').then(m => m.Test2)
  },

  {
    path: 'connexion',
    canActivate: [connectionRedirectGuard],
    loadChildren: () => import('./connection/connection.routes').then(m => m.CONNECTION_ROUTES)
  },

  {
    path: 'connexion-pro',
    canActivate: [connectionRedirectGuard],
    loadChildren: () => import('./connection/connection-pro.routes').then(m => m.CONNECTION_PRO_ROUTES)
  }
];