import { Routes } from '@angular/router';
import { ProHome } from './pages/pro-home/pro-home';
import { ProDashboard } from './pages/pro-dashboard/pro-dashboard';
import { ProSettings } from './pages/pro-settings/pro-settings';
import { ProHistorical } from './pages/pro-historical/pro-historical';
import { ProValidation } from './pages/pro-validation/pro-validation';
import { ProSelection } from './pages/pro-selection/pro-selection';
import { ProGiveBackValidation } from './pages/pro-give-back-validation/pro-give-back-validation';

export const PRO_ROUTES: Routes = [
  {
    path: '',
    component: ProHome,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ProDashboard },
      { path: 'parametres', component: ProSettings },
      { path: 'historique', component: ProHistorical },
      { path: 'borrow/validation/:id', component: ProValidation },
      { path: 'borrow/select', component: ProSelection },
      { path: 'give-back/validate', component: ProGiveBackValidation }
    ]
  }
];