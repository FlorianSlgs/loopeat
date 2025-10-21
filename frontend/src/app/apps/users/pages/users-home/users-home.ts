// users-home.ts
import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthInitService } from '../../../../connection/common/services/core/auth-init/auth-init.service';

@Component({
  selector: 'app-users-home',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './users-home.html',
  styleUrl: './users-home.css'
})
export class UsersHome {
  private readonly authInitService = inject(AuthInitService);

  currentUser = this.authInitService.getCurrentUser();

  async logout() {
    await this.authInitService.logout();
  }
}