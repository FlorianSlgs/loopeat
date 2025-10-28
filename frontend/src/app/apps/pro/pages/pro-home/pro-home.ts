import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-pro-home',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './pro-home.html',
  styleUrl: './pro-home.css'
})
export class ProHome {
  private router = inject(Router);

  onSettingsClick() {
    if (this.router.url.includes('/pro/parametres')) {
      this.router.navigate(['/pro/dashboard']);
    } else {
      this.router.navigate(['/pro/parametres']);
    }
  }

  isOnSettingsPage(): boolean {
    return this.router.url.includes('/pro/parametres');
  }
}
