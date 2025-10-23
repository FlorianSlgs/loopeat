import { Routes } from '@angular/router';

import { Accueil } from './presentation/pages/accueil/accueil';

import { UsersHome } from './apps/users/pages/users-home/users-home';
import { Dashboard } from './apps/users/pages/dashboard/dashboard';
import { Historical } from './apps/users/pages/historical/historical';
import { Boxes } from './apps/users/pages/boxes/boxes';
import { Settings } from './apps/users/pages/settings/settings';

import { Test1 } from './apps/pro/test/test';

import { Test2 } from './apps/admin/test2/test2';

import { EmailStep } from './connection/pages/user/email-step/email-step';
import { VerificationStep } from './connection/pages/user/verification-step/verification-step';
import { NameStep } from './connection/pages/user/name-step/name-step';
import { PasswordStep } from './connection/pages/user/password-step/password-step';
import { LoginPassword } from './connection/pages/user/login-password/login-password';

import { globalGuard } from './global-guard';
import { connectionRedirectGuard } from './connection-redirect.guard';

export const routes: Routes = [
  { path: '', component: Accueil },

  {
    path: 'utilisateurs',
    component: UsersHome,
    canActivate: [globalGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'historique', component: Historical },
      { path: 'boites', component: Boxes },
      { path: 'parametres', component: Settings }
    ]
  },

  { path: 'pro', component: Test1, canActivate: [globalGuard] },

  { path: 'admin', component: Test2, canActivate: [globalGuard] },

  {
    path: 'connexion',
    canActivate: [connectionRedirectGuard],
    children: [
      { path: '', component: EmailStep },
      { path: 'mot-de-passe', component: LoginPassword },
      { path: 'verification', component: VerificationStep },
      { path: 'nom', component: NameStep },
      { path: 'mdp', component: PasswordStep }
    ]
  },
  {
    path: 'connexion-pro',
    canActivate: [connectionRedirectGuard],
    children: [
      { path: '', component: EmailStep, data: { isPro: true } },
      { path: 'mot-de-passe', component: LoginPassword, data: { isPro: true } },
      { path: 'verification', component: VerificationStep, data: { isPro: true } },
      { path: 'nom', component: NameStep, data: { isPro: true } },
      { path: 'mdp', component: PasswordStep, data: { isPro: true } }
    ]
  }
];
