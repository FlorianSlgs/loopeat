import { Component, inject } from '@angular/core';
import { AuthInitService } from '../../../connection/common/services/core/auth-init/auth-init.service';

@Component({
  selector: 'app-test2',
  imports: [],
  templateUrl: './test2.html',
  styleUrl: './test2.css'
})
export class Test2 {
  private readonly authInitService = inject(AuthInitService);

  currentUser = this.authInitService.getCurrentUser();

  async logout() {
    await this.authInitService.logout();
  }
}
