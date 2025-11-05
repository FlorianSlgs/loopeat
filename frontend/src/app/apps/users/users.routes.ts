import { Routes } from '@angular/router';
import { UsersHome } from './pages/users-home/users-home';
import { Dashboard } from './pages/dashboard/dashboard';
import { Historical } from './pages/historical/historical';
import { Boxes } from './pages/boxes/boxes';
import { Settings } from './pages/settings/settings';
import { RechargeCancelComponent } from './pages/users-home/recharge-cancel/recharge-cancel';
import { RechargeSuccessComponent } from './pages/users-home/recharge-success/recharge-success';
import { Validation } from './pages/validation/validation';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    component: UsersHome,
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
  }
];