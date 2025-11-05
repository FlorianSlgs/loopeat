import { Routes } from '@angular/router';
import { EmailStep } from './pages/user/email-step/email-step';
import { VerificationStep } from './pages/user/verification-step/verification-step';
import { NameStep } from './pages/user/name-step/name-step';
import { PasswordStep } from './pages/user/password-step/password-step';
import { LoginPassword } from './pages/user/login-password/login-password';

export const CONNECTION_ROUTES: Routes = [
  { path: '', component: EmailStep },
  { path: 'mot-de-passe', component: LoginPassword },
  { path: 'verification', component: VerificationStep },
  { path: 'nom', component: NameStep },
  { path: 'mdp', component: PasswordStep }
];