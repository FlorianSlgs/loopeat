import { Routes } from '@angular/router';

import { Accueil } from './presentation/pages/accueil/accueil';

import { Test } from './apps/users/test/test';

export const routes: Routes = [
  { path: '', component: Accueil },
  
  { path: 'utilisateurs', component: Test },
];
