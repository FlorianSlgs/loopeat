import { Routes } from '@angular/router';
import { EmailStep } from './pages/user/email-step/email-step';
import { VerificationStep } from './pages/user/verification-step/verification-step';
import { NameStep } from './pages/user/name-step/name-step';
import { PasswordStep } from './pages/user/password-step/password-step';
import { LoginPassword } from './pages/user/login-password/login-password';

export const CONNECTION_PRO_ROUTES: Routes = [
  { path: '', component: EmailStep, data: { isPro: true } },
  { path: 'mot-de-passe', component: LoginPassword, data: { isPro: true } },
  { path: 'verification', component: VerificationStep, data: { isPro: true } },
  { path: 'nom', component: NameStep, data: { isPro: true } },
  { path: 'mdp', component: PasswordStep, data: { isPro: true } }
];