import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  isExpertisesOpen = false;
  isClientsOpen = false;

  toggleExpertises() {
    this.isExpertisesOpen = !this.isExpertisesOpen;
    this.isClientsOpen = false;
  }

  toggleClients() {
    this.isClientsOpen = !this.isClientsOpen;
    this.isExpertisesOpen = false;
  }

  closeMenus() {
    this.isExpertisesOpen = false;
    this.isClientsOpen = false;
  }
}