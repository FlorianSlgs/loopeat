import { Routes } from '@angular/router';

import { Accueil } from './presentation/pages/accueil/accueil';

import { UsersHome } from './apps/users/pages/users-home/users-home';
import { Dashboard } from './apps/users/pages/dashboard/dashboard';
import { Historical } from './apps/users/pages/historical/historical';
import { Boxes } from './apps/users/pages/boxes/boxes';
import { Settings } from './apps/users/pages/settings/settings';
import { RechargeCancelComponent } from './apps/users/pages/users-home/recharge-cancel/recharge-cancel';
import { RechargeSuccessComponent } from './apps/users/pages/users-home/recharge-success/recharge-success';
import { Validation } from './apps/users/pages/validation/validation';

import { ProHome } from './apps/pro/pages/pro-home/pro-home';
import { ProDashboard } from './apps/pro/pages/pro-dashboard/pro-dashboard';
import { ProSettings } from './apps/pro/pages/pro-settings/pro-settings';
import { ProHistorical } from './apps/pro/pages/pro-historical/pro-historical';
import { ProValidation } from './apps/pro/pages/pro-validation/pro-validation';
import { ProSelection } from './apps/pro/pages/pro-selection/pro-selection';
import { ProGiveBackValidation } from './apps/pro/pages/pro-give-back-validation/pro-give-back-validation';

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
      { path: 'parametres', component: Settings },
      { path: 'recharge', component: RechargeSuccessComponent },
      { path: 'annule', component: RechargeCancelComponent },
      { path: 'borrow/validation/:id', component: Validation }
    ]
  },

  {
    path: 'pro',
    component: ProHome,
    canActivate: [globalGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ProDashboard },
      { path: 'parametres', component: ProSettings },
      { path: 'historique', component: ProHistorical },
      { path: 'borrow/validation/:id', component: ProValidation },
      { path: 'borrow/select', component: ProSelection },
      { path: 'give-back/validate', component: ProGiveBackValidation },
    ]
  },

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
