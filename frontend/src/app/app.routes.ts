import { Routes } from '@angular/router';

import { Accueil } from './presentation/pages/accueil/accueil';

import { Test } from './apps/users/test/test';

import { EmailStep } from './connection/pages/user/email-step/email-step';
import { VerificationStep } from './connection/pages/user/verification-step/verification-step';
import { NameStep } from './connection/pages/user/name-step/name-step';
import { PasswordStep } from './connection/pages/user/password-step/password-step';
import { LoginPassword } from './connection/pages/user/login-password/login-password';

export const routes: Routes = [
  { path: '', component: Accueil },
  
  { path: 'utilisateurs', component: Test },

  {
    path: 'connexion',
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
    children: [
      { path: '', component: EmailStep, data: { isPro: true } },
      { path: 'mdp', component: LoginPassword, data: { isPro: true } },
      { path: 'verification', component: VerificationStep, data: { isPro: true } },
      { path: 'nom', component: NameStep, data: { isPro: true } },
      { path: 'mot-de-passe', component: PasswordStep, data: { isPro: true } }
    ]
  }
];
