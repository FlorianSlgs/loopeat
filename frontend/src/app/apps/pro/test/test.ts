import { Component, inject } from '@angular/core';
import { AuthInitService } from '../../../connection/common/services/core/auth-init/auth-init.service';

@Component({
  selector: 'app-test',
  imports: [],
  templateUrl: './test.html',
  styleUrl: './test.css'
})
export class Test1 {
  private readonly authInitService = inject(AuthInitService);

  currentUser = this.authInitService.getCurrentUser();

  async logout() {
    await this.authInitService.logout();
  }
}
