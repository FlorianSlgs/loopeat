// users-home.ts
import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-users-home',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './users-home.html',
  styleUrl: './users-home.css'
})
export class UsersHome {
  private router = inject(Router);

  onSettingsClick() {
    if (this.router.url.includes('/utilisateurs/parametres')) {
      this.router.navigate(['/utilisateurs/dashboard']);
    } else {
      this.router.navigate(['/utilisateurs/parametres']);
    }
  }

  isOnSettingsPage(): boolean {
    return this.router.url.includes('/utilisateurs/parametres');
  }
}