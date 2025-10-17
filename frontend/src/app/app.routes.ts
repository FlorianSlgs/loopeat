import { Routes } from '@angular/router';

import { Accueil } from './presentation/pages/accueil/accueil';

import { Test } from './apps/users/test/test';

import { EmailStep } from './connection/pages/user/email-step/email-step';
import { VerificationStep } from './connection/pages/user/verification-step/verification-step';
import { NameStep } from './connection/pages/user/name-step/name-step';
import { PasswordStep } from './connection/pages/user/password-step/password-step';

export const routes: Routes = [
  { path: '', component: Accueil },
  
  { path: 'utilisateurs', component: Test },

  { path: 'connexion', component: EmailStep },

  { path: 'connexion/verification', component: VerificationStep },

  { path: 'connexion/nom', component: NameStep },

  { path: 'connexion/mdp', component: PasswordStep },
];
